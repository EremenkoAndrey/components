/*
 * Объект, предназначенный для передачи наследованием его свойств создаваемым
 * компонентам.
 * 
 * Пример наследования свойств:
 * NewComponent.prototype = Object.create(Component.prototype);
 * 
 * Зависимости: 
 * - Overlay.js
 * - Controller.js
 * - jQuery
 */
"use strict";

define(['Overlay', 'Controller'], function (Overlay, Controller) {

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
            ;
            this.options = options || {};

            this.init();
        };

        var protoProp = $.extend(NewClass.prototype, Component, methods, {componentName: name});
        NewClass.prototype = protoProp;

        Controller.registerComponent(name, NewClass);

        return NewClass;
    };

   
// Пустая функция, которая будет вызвана в случае, если ее не переопределить
    Component.init = function () {};

// Получает jquery-объект или DOM-элемент.
// Возвращает DOM-элемент
// Если аргумент не корректный, сгенерирует ошибку. 
// Подходит для проверки и унификации переданного в аргументе элемента
    Component.checkDomElement = function (element) {
        if (element.jquery) {
            return element.get(0);
        } else if (element.nodeType !== undefined) {
            return element;
        } else {
            throw new Error('Element is incorrect');
        }
        ;
    };

// Сообщает объекту о наличии биндинговых событий
// Обязательный аргумент events - строка с именем события или объект с именами событий
// Например, строка 'click' сообщит о наличии в компоненте элемента с data-click
// Второй аргумент - элемент, к которому привязывается событие. По умолчанию - 
// корневой элемент компонента
    Component.bindingEvent = function (events, element) {

        var block = this.$element || $(this.checkDomElement(element));
        if (!block)
            return;

        if (typeof events === 'string') {

            block.on(events, function (e) {
                this.dataEvent(e, this);
            }.bind(this));

        } else if ($.isArray(events)) {
            for (var i = 0, max = events.length; i < max; i++) {
                block.on(events[i], function (e) {
                    this.dataEvent(e, this, block);
                }.bind(this));
            }
        }
    };

// Обрабатывает декларативно заданные в шаблоне события
// Аргументы: event - объект события, context - объект, в контексте которого 
// должен вызываться метод, который получит в аргументах jquery-объект события и 
// ссылку на элемент, вызвавший срабатывание события
    Component.dataEvent = function ($event, context, element) {
        var block = element || this.element,
                target = $event.target,
                bindObj = context || this,
                events = [];

        while (target !== block) {
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


    
    return Component;
});




