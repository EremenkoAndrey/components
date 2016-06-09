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

define(function () {
 
    var Controller = function ($object, func) {

        this.findBlocks($object);
        
        func.apply(this);
    };
    
    Controller.blocks = {};
    Controller.components = {};
    
    // Если для компонента есть ожидающий его блок, то блок активируется с этим 
    // компонентом и удяляется из очереди
    Controller.createClassInstanses = function (componentName, test){

        if (Controller.blocks[componentName] && 
                Controller.components[componentName]) {

            var blocks = Controller.blocks[componentName],
                    component = Controller.components[componentName];

            for (var i = 0, max = blocks.length; i < max; i++) {
                var options = blocks[i].el.onclick() || {};
                new component(blocks[i].el, blocks[i].controller, options);
            }
            Controller.blocks[componentName] = [];

        }

    };
    // Регистрирует компонент в общем массиве всей контроллеров
    Controller.registerComponent = function (name, Component) {

        if(!Controller.components[name]) {
            Controller.components[name] = Component;
        };

        Controller.createClassInstanses(name, 'registerComponent');
    };
    
    // Ищет на страница блоки, связанные с определенными компонентами 
    // и сохраняет их и ссылку на свой экземпляр 
    // в ассоциативном массиве Controller.blocks
    Controller.prototype.findBlocks = function ($object) {
        var __self = this,
                $item = $([0]),
                name;

        $object.find('[data-component]').each(function () {
            $item[0] = this;
            name = $item.data('component');

            if (!Controller.blocks[name]) {
                Controller.blocks[name] = [];
            }

            Controller.blocks[name].push({
                el: this,
                controller: __self
            });
            
            Controller.createClassInstanses(name, 'findBlocks');
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

            if (data) {
                listeners[i].method(data);
            } else {
                listeners[i].method();
            }
        }
    };

// Слушает событие компонента, при срабатывании события вызывает переданную функцию. 
// Первый аргумент - название события, строка
// Вторым необязательным аргументом можно передать тип события
// Последним аргументом (вторым в случае отсутствия типа) передается функция,
// которая будет вызвана при срабатывании события
// Пример: 
// this.on('change', 'test', function(){
//  console.log('changed!')
// })
// this при необходимости следует указывать явно

    Controller.prototype.on = function (name) {
        if (typeof (name) !== 'string')
            throw new Error('Incorrect listener arguments');

        var newListener = {};

        if (arguments.length === 2) {
            newListener.type = null;
            newListener.method = arguments[1];

        } else if (arguments.length === 3) {
            newListener.type = arguments[1];
            newListener.method = arguments[2];

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
// 
    Controller.prototype.stopListening = function (name, fn, type) {
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
    Controller.prototype.set = function (propObj, silence) {

        if (typeof (propObj) !== 'object')
            throw Error('Incorrect set argument');
        for (var prop in propObj) {
            if (!propObj.hasOwnProperty(prop))
                continue;

            if (this[prop] && this.hasOwnProperty(prop)) {
                this[prop] = propObj[prop];
            }

            if (!silence) {
                this.trigger('change', prop);
            }
        }
    };
    
    return Controller;

});
