var menuElement = document.getElementById('header');

handleTopics(menuElement);


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

  Array.prototype.forEach.call(menuItemElements, initializeMenuItem)
  window.onscroll = _.throttle(handleScroll, 100);
  window.onresize = _.debounce(initializeMenuItems.bind(null, menuItemElements), 100);

  pageData.active = location.hash.replace('#', '') || 'who-we-are';


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