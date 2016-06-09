/*
 * ПРИМЕР КОМПОНЕНТА
 * 
 * Компонент фиксирует меню вверху страницы при прокрутке
 * 
 * elem - DOM-элемент (в случае jQuery-объекта будет использован первый элемент из коллекции)
 * param - объект с параметрами:
 * - param.addedClassName - задает css класс, который фиксирует блок вверху страницы
 * 
 * Зависимости: 
 * - jQuery
 * - Component.js
 */

define(['Component'],function (Component) {
    
    Component.create('MainMenu', {
        init: function () {

            this.fixed = false;
            
            this.controller.on('fixedMenu', function () {

                if(this.fixed) return;
                this.fixedTop();
                
            }.bind(this));
            
            this.controller.on('unfixedMenu', function () {
                
                if(!this.fixed) return;
                this.unfixedTop();
                
            }.bind(this));

        },
        
        fixedTop: function () {
            this.$el.addClass(this.options.fixedClass);
            this.fixed = true;
        },
        unfixedTop: function () {
            this.$el.removeClass(this.options.fixedClass);
            this.fixed = false;
        }
    });
    
});