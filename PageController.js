/*
 *  ПРИМЕР КОНТРОЛЛЕРА
 */

define(['Controller', 'Component', 'MainMenu', 'FloatMobileHead'],function (Controller, Component) {
    
    new Controller($('body'), function () {
        this.topInterval = 105;
        this.topInterval2 = 1105;
        this.mobileHeadHeight = null;
        
        var $window = $(window);
        var scrollTop = $window.scrollTop();
        
        $(document).ready(function () {

            if(scrollTop > this.topInterval) {
                this.trigger('fixedMenu');
            }
            
        }.bind(this));
        
        $window.on('scroll', function () {
            scrollTop = $window.scrollTop();

            // Фиксация меню
            if(scrollTop > this.topInterval) {
                this.trigger('fixedMenu');
            } else {
                this.trigger('unfixedMenu');
            }

            // Фиксация мобильной плашки
            if(scrollTop > this.mobileHeadHeight) {
                this.trigger('hideMobileHeader');
            } else {
                this.trigger('notHideMobileHeader');
            }
          
        }.bind(this));

    });
    
//    require(['MainMenu']);
//    require(['FloatMobileHead']);


});


