

var menuElement = document.getElementById('header');
var actionsElement = document.getElementById('actions');
var textareas = document.getElementsByTagName('textarea');
var formsElements = document.getElementsByTagName('form');

handleTopics(menuElement);
handleActions(actionsElement);
handleTextareas(textareas);
handleForms(formsElements);

function handleTextareas(textareas){
  Array.prototype.forEach.call(textareas, handleTextarea);

  function handleTextarea(textarea){
    textarea.addEventListener('keyup', autoResize);
  }

  function autoResize(keyEvent){
    var textareaHeight = this.getBoundingClientRect();
    if(this.scrollHeight > textareaHeight.height){
      this.style.height = '';
      this.style.height = this.scrollHeight + 20 + 'px';      
    }
  }
}


function handleForms(formsElements){
  Array.prototype.forEach.call(formsElements, handleForm);

  function handleForm(formElement){
    var inputs = formElement.querySelectorAll('input[type=text], input[type=email], textarea');
    var checks = formElement.getElementsByClassName('form-check-group');
    var submitButton = formElement.getElementsByTagName('button')[0];
    var checkValid = _.debounce(_checkValid.bind(formElement), 100);

    formElement.addEventListener('keyup', checkValid);
    formElement.addEventListener('change', checkValid);

    checkValid.call(formElement);

    function _checkValid(){
      var valid = true;

      Array.prototype.forEach.call(inputs, function(input){
        if(input.value.length == 0){
          valid = false;
          input.parentNode.classList.remove('valid');
        } else {
          input.parentNode.classList.add('valid');
        }
      });

      Array.prototype.forEach.call(checks, function(check){
        if(check.querySelectorAll('input[type=checkbox]:checked').length == 0){
          valid = false;
          check.parentNode.classList.remove('valid');
        } else {
          check.parentNode.classList.add('valid');
        }
      });

      if(valid){
        submitButton.removeAttribute('disabled');
      } else if(!submitButton.disabled) {
        submitButton.setAttribute('disabled', true);
      }
    }
  }
}

function handleActions(actionsElement){

  var url = 'https://script.google.com/macros/s/AKfycbw5eVzBNXlIJEsfaSUWCUG9kaYN9wypZu50QMCMOnBZcaaRnlU/exec';
  var active = '';
  var actionItemElements = actionsElement.getElementsByTagName('a');
  var form = document.getElementById('form');
  initializeActionItems(actionItemElements)


  function initializeActionItems(actionItemElements){
    Array.prototype.forEach.call(actionItemElements, initializeActionItem);
  }

  function initializeActionItem(actionItem){
    var action = actionItem.hash.replace('#', '');
    actionItem.addEventListener('click', _.partial(setFormAction, action));
  }

  function setFormAction(action, mouseEvent){
    mouseEvent.preventDefault();

    if(active){
      deactivateAction(active, this);
    }
    if(active != action){
      activateAction(action, this);
    } else {
      active = '';
    }
  }

  function activateAction(action, clickedActionElement){
    var actionContainer = document.getElementById(action);
    var submitButton = actionContainer.getElementsByTagName('button')[0];
    var actionTop;

    actionContainer.classList.remove('closed');
    clickedActionElement.classList.add('active');

    actionTop = actionContainer.getBoundingClientRect().top;
    animatedScrollTo(document.body, window.scrollY + actionTop - 100, 500);

    submitButton.addEventListener('click', _.partial(submitForm, action));
    active = action;
  }

  function deactivateAction(action){
    var pastActionElement = actionsElement.querySelector('[href="#'+action+'"]');
    var actionContainer = document.getElementById(action);
    var actionForm = actionContainer.getElementsByTagName('form')[0];
    var submitButton = actionContainer.getElementsByTagName('button')[0];

    actionContainer.classList.add('closed');
    pastActionElement.classList.remove('active');
    pastActionElement.blur();

    submitButton.removeEventListener('click', _.partial(submitForm, action));
  }

  function submitForm(action, mouseEvent){
    var checks = this.parentNode.parentNode.querySelectorAll('input[type=checkbox]:checked');
    var formData, formSubmit;
    mouseEvent.preventDefault();
    this.parentNode.parentNode.classList.add('submitting');

    formData = new FormData(this.parentNode.parentNode);
    formData.append('sheet_name', action);
    var checkValues = {};

    Array.prototype.forEach.call(checks, function(checkbox){
      var checkName = checkbox.name.replace('[]', '');
      checkValues[checkName] = checkValues[checkName] || [];
      checkValues[checkName].push(checkbox.value);
    });

    _.each(checkValues, function(checkValue, name){
      formData.append(name, checkValue.join(', '));
    });

    formSubmit = new XMLHttpRequest();
    formSubmit.addEventListener("load", submitComplete.bind(this));
    formSubmit.open("POST", url, true);
    formSubmit.send(formData);

    function submitComplete () {
      var thankYou = this.parentNode.parentNode.parentNode.getElementsByClassName('thank-you');
      this.parentNode.parentNode.classList.remove('submitting');
      this.parentNode.parentNode.classList.add('closed');
      thankYou[0].classList.remove('closed');
    }
  }

}


function handleTopics(menuElement){

  var menuItemElements = menuElement.getElementsByTagName('a');
  var topic = '';
  var topics = {};
  var topicChanging = false;

  var pageData = {
    get active() {
      return topic;
    },
    set active(value) {
      if(!topicChanging){
        topicChanging = true;
        setActiveTopic(topic, value);
        topic = value;

        setTimeout(function(){
          topicChanging = false;
        }, 10);
      }
    },

    get topics() {
      return _.sortBy(topics, function(topic){
        return -1 * topic.top;
      });
    },

    set topics(value) {

      topicsByTop = pageData.topics
      previousTopic = _.first(topicsByTop)

      if(previousTopic){
        previousTopic.bottom = value.top;
        pageData.topics[previousTopic.name] = previousTopic;
      }

      topics[value.name] = value;
    },

    get activeInfo() {
      return topics[topic];
    }
  };

  initializeMenuItems(menuItemElements);
  window.onscroll = _.throttle(handleScroll, 100);
  window.onresize = _.debounce(initializeMenuItems.bind(null, menuItemElements), 100);

  pageData.active = _.intersection(_.keys(topics), [location.hash.replace('#', '')])[0] || 'who-we-are';


  function initializeMenuItems(menuItemElements){
    Array.prototype.forEach.call(menuItemElements, initializeMenuItem);
  }

  function initializeMenuItem(menuItem){
    var menuTopic = menuItem.hash.replace('#', '')
    var topicData = {name: menuTopic, top: getFromTop(menuTopic), bottom: getBottom(menuTopic), menuItem: menuItem};
    pageData.topics = topicData;

    menuItem.addEventListener('click', _.partial(menuItemHandleClick, topicData));
  }

  function menuItemHandleClick(topicData, mouseEvent){
    mouseEvent.preventDefault();
    if(topicData.name != getTopicFromScrollTop()){
      animatedScrollTo(document.body, topicData.top - 100, 200);
    }
  }

  function handleScroll(scrollEvent){
    var topic = getTopicFromScrollTop();
    if(topic != pageData.active){
      pageData.active = topic;
    }
  }

  function getFromTop(topic){
    var topicElement = document.getElementById(topic);
    return topicElement.offsetTop;
  }

  function getBottom(topic){
    var topicElement = document.getElementById(topic);
    return (topicElement.offsetTop) + topicElement.clientHeight;
  }

  function setActiveTopic(oldTopic, newTopic){
    if(oldTopic != newTopic){
      history.replaceState(null, null, '#'+newTopic);
      topics[newTopic].menuItem.classList.add('active');

      if(typeof topics[oldTopic] != 'undefined'){
        topics[oldTopic].menuItem.blur();
        topics[oldTopic].menuItem.classList.remove('active');
      }
    }
  }

  function getTopicFromScrollTop(){

    var topic = _.chain(pageData.topics)
      .map(calcPixelsShowing)
      .sortBy('showing')
      .last()
      .value();

    return topic.name;

    function getMaxTop(pageTopic){
      return Math.max(window.scrollY, pageTopic.top - 100);
    }

    function getMinBottom(pageTopic){
      return Math.min(window.scrollY + window.innerHeight, pageTopic.bottom);
    }

    function calcPixelsShowing(pageTopic){
      var pageStuff = {
        name: pageTopic.name
      };
      pageStuff.showing =  getMinBottom(pageTopic) - getMaxTop(pageTopic);
      return pageStuff;
    }
  }
}