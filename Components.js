/*
 * Экземпляр этого объекта - контроллер, умеющий слушать события компонентов
 * 
 * Пример создания экземпляра:
 * var page = new Controller({
 *      init: function(){
 *          console.log('Controller created!');
 *      }
 * })
 * 
 * Определяемая при создании объекта функция init() будет вызвана при создании экземпляра
 * 
 * Зависимости: 
 * - jQuery
 * 
 */

var Controller = function () {
    var func;
    
    if(arguments.length > 1 ) {
        this.$el = arguments[0];
        func = arguments[1];
    } else {
        this.$el = $(document);
        func = arguments[0];
    }

    this.findBlocks(this.$el);

    func.apply(this);

};

Controller.blocks = {};
Controller.components = {};

// Если для компонента есть ожидающий его блок, то блок активируется с этим 
// компонентом и удяляется из очереди
Controller.createClassInstanses = function (componentName) {

    if (Controller.blocks[componentName] &&
            Controller.components[componentName]) {

        var blocks = Controller.blocks[componentName],
                component = Controller.components[componentName];

        for (var i = 0, max = blocks.length; i < max; i++) {
            var options = blocks[i].$el.get(0).onclick() || {};
            new component(blocks[i].$el, blocks[i].controller, options);
        }
        Controller.blocks[componentName] = [];

    }

};
// Регистрирует компонент в общем массиве всей контроллеров
Controller.registerComponent = function (name, Component) {

    if (!Controller.components[name]) {
        Controller.components[name] = Component;
    }

    Controller.createClassInstanses(name);
};

// Ищет на страница блоки, связанные с определенными компонентами 
// и сохраняет их и ссылку на свой экземпляр 
// в ассоциативном массиве Controller.blocks
Controller.prototype.findBlocks = function ($object) {
    var __self = this,
            $item = $([0]),
            name,
            $elements;
    
    $elements = ($object.get(0) === document) ? $('[data-component]') : $object.find('[data-component]');

    $elements.each(function () {
        $item[0] = this;
        name = $item.data('component');

        if (!Controller.blocks[name]) {
            Controller.blocks[name] = [];
        }

        Controller.blocks[name].push({
            $el: $item,
            controller: __self
        });

        Controller.createClassInstanses(name);
    });

};

// Вызывает событие: пробегает по списку подписчиков и инициирует соответствующие 
// методы. Помимо назывнаия события может сообщать его тип. 
// Пример: 
// this.trigger('change', 'test');
// Аргументы:
// name (строка) - название события 
// type (строка) - тип события 
// data - произвольные данные, которые будут переданы в качестве аргумента вызываемому
// методу
Controller.prototype.trigger = function (name, type, data) {
    this.listenetrs = this.listenetrs || {};

    if (!this.listenetrs[name])
        return;
    var listeners = this.listenetrs[name];

    for (var i = 0, max = listeners.length; i < max; i++) {
        if (type && listeners[i].type !== type) {
            continue;
        }

        var context = listeners[i].context;

        if (data) {
            listeners[i].method.call(context, data);
        } else {
            listeners[i].method.call(context);
        }
    }
};

// Слушает событие компонента, при срабатывании события вызывает переданную функцию. 
// Первый аргумент - название события, строка
// Вторым необязательным аргументом можно передать тип события
// Третьим аргументом (вторым в случае отсутствия типа) передается функция,
// которая будет вызвана при срабатывании события
// Последний аргумент - контекст, в котором будет вызвана переданная функция
// Пример: 
// this.on('change', 'test', function(){
//  console.log('changed!')
// }, this)

Controller.prototype.on = function (name) {

    if (typeof (name) !== 'string')
        throw new Error('Incorrect listener arguments');

    var newListener = {};

    if (arguments.length === 3) {
        newListener.type = null;
        newListener.method = arguments[1];
        newListener.context = arguments[2];

    } else if (arguments.length === 4) {
        newListener.type = arguments[1];
        newListener.method = arguments[2];
        newListener.context = arguments[3];

    } else {
        throw new Error('Incorrect listener arguments');
    }

    if (typeof (newListener.method) !== 'function') {
        throw new Error('Callback is not a function');
    }

    this.listenetrs = this.listenetrs || {};

    this.listenetrs[name] = this.listenetrs[name] || [];

    this.listenetrs[name].push(newListener);

};

// Прекращает прослушивание события. Необходимо передать:
// name: Название события (строка) - обязательно
// fn: Функция (ссылка на функцию, на ТУ ЖЕ САМУЮ функцию) - обязательно
// type: Тип (строка), не обязательный аргумент
// TODO: сделать функцию необязательный аргументом

Controller.prototype.stopListening = function (name, type, fn) {
    if (!this.listenetrs[name])
        return;
    var listeners = this.listenetrs[name];

    for (var i = 0, max = listeners.length; i < max; i++) {
        if (type && listeners[i].type !== type) {
            continue;
        }

        if (listeners[i].method === fn) {
            listeners.splice(i, 1);
        }
    }
};

// Изменяет собственное свойство объекта, при его наличии.
// При изменении срабатывает событие 'change' с типом соответствующим 
// имени изменяемого свойства
// Аргументы:
// propObj - объект, в котором перечислены свойства и их устанавливаемые значения
// silence - булево значение, не обязательно, если передать true, событие не сработает
// Пример:
// this.set({'proper': 6});
// Установит в свойство this.proper значение 6
// сгенерирует событие 'change' с типом 'proper'
// TODO: не создавать событие, если совйство не изменилось
Controller.prototype.set = function (propObj, silence) {

    if (typeof (propObj) !== 'object')
        throw Error('Incorrect set argument');

    for (var prop in propObj) {
        if (!propObj.hasOwnProperty(prop))
            continue;

        this[prop] = propObj[prop];

        if (!silence) {
            this.trigger('change', prop);
        }
    }
};



/*
 * Объект singleton, управляющий созданием и показом блока оверлей.
 * Если блока нет на странице, то он будет создан, если есть - к нему будет добавлен 
 * css-класс .active
 * Возможно создание обычного оверлея с id "overlay" и аналогичным классом
 * и версии для мобильных телефонов с id "overlay_mobile" и аналогичным классом
 * 
 * Примеры:
 * - Показать оверлей (создаст при необходимости):
 * this.showOverlay();
 * - Показать мобильный оверлей:
 * this.showMobileOverlay()
 * будет показад блок с id и классом "overlay_mobile" 
 * 
 * Зависимости: 
 * - jQuery
 */

var Overlay = function () {
    var instance;
    Overlay = function Overlay() {
        return instance;
    };
    Overlay.prototype = this;
    instance = new Overlay();
    instance.constructor = Overlay;

    var overlay = document.getElementById('overlay'),
            mobileOverlay = document.getElementById('overlay_mobile'),
            $overlay,
            $mobileOverlay;

    if (overlay) {
        $overlay = $($overlay);
    }

    if (mobileOverlay) {
        $mobileOverlay = $($mobileOverlay);
    }

    var status = false,
            mobileStatus = false;

    // Создать/показать оверлей 
    this.showOverlay = function () {
        if (!overlay) {
            createOverlay();

            $overlay.addClass('active');
            status = true;

        } else if (!status) {

            $overlay.addClass('active');
            status = true;
        }
    };

    // Создать/показать мобильный оверлей 
    this.showMobileOverlay = function () {

        if (!mobileOverlay) {
            createOverlay('_mobile');

            $mobileOverlay.addClass('active');
            mobileStatus = true;

        } else if (!mobileStatus) {

            $mobileOverlay.addClass('active');
            mobileStatus = true;
        }

    };

    // Скрыть оверлей
    this.hideOverlay = function () {
        if ($overlay && status) {
            $overlay.removeClass('active');
            status = false;
        }
    };

    // Скрыть мобильный оверлей
    this.hideMobileOverlay = function () {
        if ($mobileOverlay && mobileStatus) {
            $mobileOverlay.removeClass('active');
            mobileStatus = false;
        }
    };

    // Функция создает оверлей и добавляет его на страницу
    function createOverlay(mobileModifier) {
        var mod = mobileModifier || '';

        var $block = $('<div class="overlay' + mod + '" id="overlay' + mod + '"></div>');

        if (mobileModifier) {
            $mobileOverlay = $block;
            mobileOverlay = $block.get(0);
        } else {
            $overlay = $block;
            overlay = $block.get(0);
        }

        $block.appendTo('body');
    }


    return instance;
};

/*
 * Объект, предназначенный для передачи наследованием его свойств создаваемым
 * компонентам.
 * 
 * Пример вызова:
 * Component.create('MainMenu', {
 *  init: function(){
 *      console.log('Компонент MainMenu инициирован!');
 *  }
 * });
 * 
 * Зависимости: 
 * - Overlay.js
 * - Controller.js
 * - jQuery
 */
var Component = {};
// Функция создает новый компонент.
// первый аргумент - строка с названием компонента,
// второй аргумент - объект с методами нового объекта
Component.create = function (name, methods) {

    var NewClass = function (block, controller, options) {
        this.controller = controller;
        this.$el = block.jquery ? block : $(block);
        this.el = this.$el.get(0);
        if (this.$el.length > 1) {
            this.$el = $(this.el);
        }

        this.options = options || {};

        this.init();
    };

    var protoProp = $.extend(NewClass.prototype, Component, methods, {componentName: name});
    NewClass.prototype = protoProp;
    NewClass.prototype.constructor = Component;

    Controller.registerComponent(name, NewClass);

    return NewClass;
};


// Пустая функция, которая будет вызвана в случае, если ее не переопределить
Component.init = function () {};

// Вешает на корневой элемент событие, имя которого передается в аргументе
// в дальнейшем обработка того собятия делегируется с вложенных элементов, у которых декларативно
// определен обработчик в свойстве data-имяСобытия
// Обязательный аргумент events - строка с именем события или объект с именами событий
// Например, строка 'click' сообщит о наличии в компоненте элемента с data-click
Component.bindingEvent = function (events) {

    if (typeof events === 'string') {

        this.$el.on(events, function (e) {
            this.dataEvent(e, this);
        }.bind(this));

    } else if ($.isArray(events)) {
        for (var i = 0, max = events.length; i < max; i++) {
            this.$el.on(events[i], function (e) {
                this.dataEvent(e, this, block);
            }.bind(this));
        }
    }
};

// Обрабатывает декларативно заданные в шаблоне события
// Аргументы: event - объект события, context - объект, в контексте которого 
// должен вызываться метод, который получит в аргументах jquery-объект события и 
// ссылку на элемент, вызвавший срабатывание события
Component.dataEvent = function ($event, context) {
    var target = $event.target,
            bindObj = context || this,
            events = [];

    while (target !== this.el) {
        if ($(target).data()[$event.type]) {
            events.push({
                method: $(target).data()[$event.type],
                target: target
            });
        }
        target = $(target).parent().get(0);
    }
    if (!events.length)
        return;

    for (var i = 0, max = events.length; i < max; i++) {
        tryOnMethods(events[i], bindObj);
    }

    // Пробует вызвать переданные в строке методы
    // Получает в 1 аргументе объект с названиями методов и ссылками на элемент,
    // вызвавший срабатывание события
    // во втором аргументе - объект, в контексте которого попробовать вызвать метод
    function tryOnMethods(dataFromEventElem, context) {
        var methods = dataFromEventElem.method.split(/\s+/);

        for (var i = 0, max = methods.length; i < max; i++) {
            if (context[methods[i]]) {
                context[methods[i]]($event, dataFromEventElem.target);
            }
        }
    }
};

// Методы showOverlay и hideOverlay - обертки для доступа к методам модуля Overlay
// Наличие аргумента предполагает, что необходимо создать/удалить оверлей, который 
// будет показан только в мобильных устройствах
//
// Создает/показывает оверлей
Component.showOverlay = function (forMobile) {
    var overlay = new Overlay;
    if (forMobile) {
        overlay.showMobileOverlay();
    } else {
        overlay.showOverlay();
    }
};
// Скрывает оверлей
Component.hideOverlay = function (forMobile) {
    var overlay = new Overlay;
    if (forMobile) {
        overlay.hideMobileOverlay();
    } else {
        overlay.hideOverlay();
    }
};

