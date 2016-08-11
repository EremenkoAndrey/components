Component.create('FirstTestComponent', {
    init: function () {
        console.log(this.intstId + ' inited');
        this.controller.on('test-event', 'type', function (){
            console.log('test-event');
        });
    },
    events: ['click'],
    test: function () {
        console.log('test');
    }
});

Component.create('SecondTestComponent', {
    init: function () {
        console.log(this.intstId + ' inited');
        this.controller.trigger('test-event');
    },
    test2: function () {}
});

var controller;

describe("Controller", function () {
    
    beforeEach(function () {
        controller = new Controller(function () {    });
        
    });
    
    it("Controller создается", function () {
        expect(Controller).toBeDefined();
    });
    
//    it("findBlocks находит два блока и добавляет их в массив Controller.blocks", function () {
//        expect(Controller.blocks['FirstTestComponent']).toBeDefined();
//        expect(Controller.blocks['SecondTestComponent']).toBeDefined();
//    });
//    
//    it("Соответствующие блоку компоненты уже зарегистрированы", function () {
//        expect(Controller.components['FirstTestComponent']).toBeDefined();
//        expect(Controller.components['SecondTestComponent']).toBeDefined();
//    });
    

});

//describe("Component", function() {
//    var fixture = setFixtures('<div data-component="FirstTestComponent"><a data-click="test" href="#"><span><b data-click="test"></b></span></a></div>');
//    
//    var FirstComponent = Component.create('FirstTestComponent', {
//        init: function () {
//        },
//        events: ['click'],
//        test: function () {
//            console.log('test');
//        }
//    });
//
//    var SecondComponent = Component.create('SecondTestComponent', {
//        test2: function () {}
//    });
//
//    var firstInstance = new FirstComponent(fixture, {});
//    var secondInstance = new SecondComponent($('<div></div>'), {});
//
//    describe("Component.create создает новые классы", function() {
//
//        it("Component.create создает функцию", function() {
//            expect(typeof FirstComponent === 'function').toBe(true);
//        });
//        it("Новая функция - это класс, создающий объекты", function() {
//            expect(typeof firstInstance === 'object').toBe(true);
//        });
//        it("Переданные методы становятся методами экземпляров класса", function() {
//            expect(FirstComponent.prototype.test).toBeDefined();
//            expect(firstInstance.test).toBeDefined();
//            expect(typeof firstInstance.test === 'function').toBeDefined();
//        });
//        it("Классы имеют разные прототипы...", function() {
//            expect(FirstComponent.prototype === SecondComponent.prototype).toBe(false);
//        });
//        it("...но общий объект-конструктор", function() {
//            expect(FirstComponent.prototype.constructor).toBeDefined();
//            expect(FirstComponent.prototype.constructor === SecondComponent.prototype.constructor).toBe(true);
//        });
//    });
//
//    it("Component.init() определен и наследуется экземплярами", function() {
//        expect(Component.init).toBeDefined();
//        expect(firstInstance.init).toBeDefined();
//    });
//
//    describe("Биндинг событий", function() {
//
//        it("Component.dataEvent() вложенные элементы с data-click срабатывают: два вложенных элемента вызовут событие два раза", function() {
//            spyOn(firstInstance, 'test');
//            $('b', fixture).trigger('click');
//            expect(firstInstance.test).toHaveBeenCalledTimes(2);
//        });
//
//        it("Component.bindingEvent() вешает переданное в аргументе событие на корневой элемент, вызывая по нему dataEvent()", function() {
//            spyOn(firstInstance, 'dataEvent');
//            fixture.trigger('click');
//            expect(firstInstance.dataEvent).toHaveBeenCalled();
//        });
//
//        it("Component.dataEvent() при клике на элементе вызывает метод, записанный в data-click", function() {
//            spyOn(firstInstance, 'test');
//            $('a', fixture).trigger('click');
//            expect(firstInstance.test).toHaveBeenCalled();
//        });
//
//        it("Component.dataEvent() при клике на вложенном элементе вызывает метод, записанный в data-click родителя", function() {
//            spyOn(firstInstance, 'test');
//            $('span', fixture).trigger('click');
//            expect(firstInstance.test).toHaveBeenCalled();
//        });
//    });
//
//
//});

