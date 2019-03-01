var ei, eventInsight;
ei = eventInsight = (function() {
  const nsp = '[EventInsight] ';
  var __snapshot__;

  function walk(node, onEnterNode) {
    onEnterNode(node);
    var node = node.firstChild;
    while (node) {
        walk(node, onEnterNode);
        node = node.nextSibling;
    }
  }

  const hq = {
    trace: '',
    debug: false
  }

  function wrapListener(node, eventType, listener) {
    return function() {
      const event = arguments[0];
      if (hq.trace && (hq.trace === 'all' || hq.trace === eventType)) {
        console.log(nsp + 'Trigger eventType: ' + eventType);
        console.log('Target:', node);
        console.log('Event:', event);
        console.log('Listener:', listener);
        console.log('===========================\n');
        if (hq.debug) debugger;
      }
      const ret = listener.apply(this, arguments);
      return ret;
    }
  }

  function tamperListeners(entry) {
    const [node, listenersMap] = entry;
    for (let eventType in listenersMap) {
      const listeners = listenersMap[eventType];
      listeners.forEach(listener => {
        node.removeEventListener(eventType, listener);
        node.addEventListener(eventType, wrapListener(node, eventType, listener));
      });
    }
  }

  function tamper() {
    if (!__snapshot__) __snapshot__ = getSnapshotOfDomEventListeners();
    const db = Array.from(__snapshot__.entries());
    db.forEach(entry => {
      tamperListeners(entry);
    })
  }

  function getSnapshotOfDomEventListeners() {
    const snapshot = new Map();
    walk(document.body, function (node) {
      if (node instanceof EventTarget) {
        // `getEventListeners()` only exists in ChromeDevTool
        const eventListeners = getEventListeners(node)
        const eventListenersEntries = Object.entries(eventListeners)
        if (eventListenersEntries.length > 0) {
          const eventListenersMap = eventListenersEntries.reduce((acc, entry) => {
            const [eventType, listenerDescs] = entry;
            acc[eventType] = listenerDescs.map(item => item.listener);
            return acc;
          }, {})
          snapshot.set(node, eventListenersMap);
        }
      }
    });

    return snapshot;
  }

  function eventInsight(query, dbMap) {
    if (!__snapshot__) __snapshot__ = getSnapshotOfDomEventListeners();
    if (!dbMap) dbMap = __snapshot__;
    
    const db = Array.from(dbMap.entries())
    if (typeof query === 'string') {
      // case EVENT_TYPE
      return findByEventType(db, query);
    } else if (typeof query === 'function'){
      // case EVENT_LISTENER
      return findByListener(db, query);
    } else if (query instanceof HTMLElement) {
      // case NODE
      const result = new Map();
      if (dbMap.has(query)) {
        result.set(query, dbMap.get(query))
      }
      return result;
    } else if (typeof query === 'object' && query['event'] && query['node']) {
      // case QUERY: { node, event }
      const { event, node } = query;

      // check for event first;
      const result = findByEventType(db, event);
      
      if (result.size === 0) {
        return new Map();
      }
      let found;
      if (result.has(node)) {
        found = node;
        console.log(nsp + 'Exact match found!')
      } else {
        console.log(nsp + 'No exact match found, try find within nearest 10 parent nodes.')
        let iter = 0;
        let target = node.parentNode;
        while (target && iter < 10) {
          iter++;
          if (result.has(target)) {
            found = target;
            break;
          }
          target = node.parentNode;
        }
      }

      const narrowDownResult = new Map();
      if (found) {
        narrowDownResult.set(node, result.get(found));
      }

      return narrowDownResult;
    }

    console.log(nsp + 'Invalid query', query);
    return null;
  }

  function findByEventType(db, query) {
    const result = new Map();
    db.forEach(([node, listenersMap]) => {
      if (listenersMap.hasOwnProperty(query)) {
        result.set(node, listenersMap)
      }
    })
    return result;
  }

  function findByListener(db, query) {
    const result = new Map();
    db.forEach(([node, listenersMap]) => {
      const listenersMapEntry = Object.entries(listenersMap)
      const resultListenersMap = {}
      listenersMapEntry.forEach(([eventType, listeners]) => {
        if (listeners.indexOf(query) > -1) {
          if (listeners.indexOf(query)) {
            resultListenersMap[eventType] = [query]
          }
        }
      })
      result.set(node, resultListenersMap);
    });
    return result;
  }

  return { 
    find: eventInsight,
    getSnapshot: getSnapshotOfDomEventListeners,
    tamper,
    trace(eventType) {
      hq.trace = eventType;
    },
    debug(boolean) {
      hq.debug = boolean;
    }
  }
})();
