var menuElement = document.getElementById('header');

handleTopics(menuElement);


function handleTopics(menuElement){

  var menuItemElements = menuElement.getElementsByTagName('a');
  var topic = '';
  var topics = {};
  var topicChanging = false;
  var scrollDirection = -1;
  var lastScroll = window.scrollY;
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
      topics[value.name] = value;
    },

    get activeInfo() {
      return topics[topic];
    }
  };

  Array.prototype.forEach.call(menuItemElements, initializeMenuItem)
  window.onscroll = _.throttle(scrollHandler, 100);
  pageData.active = location.hash.replace('#', '') || 'who-we-are';


  function initializeMenuItem(menuItem){
    var menuTopic = menuItem.hash.replace('#', '')

    pageData.topics = {name: menuTopic, top: getFromTop(menuTopic), menuItem: menuItem}

    menuItem.addEventListener('click', function(mouseEvent){
      mouseEvent.preventDefault();
      pageData.active = menuTopic;
      if(getTopicFromScrollTop() != menuTopic){
        window.scrollTo(0, pageData.activeInfo.top);
      }
    });
  }

  function scrollHandler(scrollEvent){
    scrollDirection = Math.sign(lastScroll - window.scrollY);
    lastScroll = window.scrollY;

    var topic = getTopicFromScrollTop();
    if(topic != pageData.active){
      pageData.active = topic;
    }
  }

  function getFromTop(topic){
    var topicElement = document.getElementById(topic);
    return topicElement.offsetTop;
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
    var topic = _.find(pageData.topics, function(pageTopic){
      return window.scrollY >= pageTopic.top;
    });
    return topic.name;
  }

}