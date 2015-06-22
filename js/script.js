(function($) {

  $.fn.peekABoo = function( options ) {
  
    var settings = $.extend({
      
      circularSlider : true,
      autostartSlider : true,      
      sliderInterval : 4000,
      sliderDirection : "next",
      stopOnInteraction : true,
      stopAfterDuration : 30000,
      animationDuration : 300      
      
    }, options); 
  
    var peekABoo = this,
        $slideWindow = $(this).find('.js-peekaboo-window'),
        $slideBody = $(this).find('.js-peekaboo-slide-body'),
        $slides = $(this).find('.js-peekaboo-slide'),
        $pagingDots = $(this).find('.js-peekaboo-paging-dot'),
        $pagingGoToPrev = $(this).find('.js-peekaboo-pager-prev'),
        $pagingGoToNext = $(this).find('.js-peekaboo-pager-next'),
        originalNumSlides = $(this).find('.js-peekaboo-slide').length; 
                        
    peekABoo.init = function(){
      
      if ($slides.length > 1){
      
        if (settings.circularSlider == true){
          peekABoo.makeCircular();
          peekABoo.bindPagerPrevNextClicksCircular();
          peekABoo.bindPagerDotClicksCircular();        
        } else {
          peekABoo.bindPagerPrevNextClicks();
          peekABoo.bindPagerDotClicks(); 
        }      
        
        if (settings.autostartSlider == true){
          peekABoo.autoStart(settings.sliderInterval, settings.sliderDirection, settings.stopOnInteraction, settings.stopAfterDuration)  
      }  

      } else {

        peekaboo.setupSingleImageGallery();
      
      }      
      
    };
    
    /**
     * makeCircular()       
     * 
     * To make peekaboo slider circular, clone all of the slides, and append the set of clones
     * to the end of the existing slides.  then, pick up the last TWO slides in the group, 
     * detach them from the DOM, and prepend them to the set of slides.
     * 
     * Assuming we have slides "1 2 3 4", this will result in "3 4 *1* 2 3 4 1 2", and the gallery 
     * will start on the *1* slide.  This puts the peekaboo slides in place but allows
     * us to always start on the slide specified as first.
     */    
    peekABoo.makeCircular = function(){

      $slideBody.append($slides.clone()); 
      
      var $slideToMove = $(peekABoo).find('.js-peekaboo-slide').last().detach();          
      $slideBody.prepend($slideToMove);
      
      var $slideToMove = $(peekABoo).find('.js-peekaboo-slide').last().detach();          
      $slideBody.prepend($slideToMove);
      
      $(peekABoo).find('.js-peekaboo-slide').eq(2).addClass('active'); 
    
    };

    peekABoo.autoStart = function(sliderInterval, sliderDirection, stopOnInteraction, stopAfterDuration){

      // loop through slides at rate defined by 'sliderInterval'
      var autoplay = setInterval(function(){
        
        if (typeof sliderDirection == 'undefined' || sliderDirection == 'next'){
          $pagingGoToNext.trigger("click");   
        } else if (typeof sliderDirection !== 'undefined' && sliderDirection == 'prev'){
          $pagingGoToPrev.trigger("click"); 
        }      
        
      }, sliderInterval); 
      
      // if 'stopOnInteraction' == true, stop the autoplay loop on interaction w/ the gallery
      if (typeof stopOnInteraction !== 'undefined' && stopOnInteraction == true){      
        $(peekABoo).find('.js-peekaboo-container').on('click', function(e){
          
          e.stopPropagation();
          e.preventDefault(); 
          
          // watch for real human interaction, and stop the slider.
          if (e.hasOwnProperty('originalEvent')){           
            clearInterval(autoplay);   
          }; 
          
        }); 
      } 
      
      // if 'stopAfterDuration' is defined, stop the autoplay loop after 'stopAfterDuration' milliseconds have passed      
      if (typeof stopAfterDuration !== 'undefined' && stopAfterDuration > 0){
        setTimeout(function(){
          clearInterval(autoplay); 
        }, stopAfterDuration);     
      
      }
    
    }; 
    
    /**
     * setupSingleImageGallery()       
     * 
     * If we only have one image in the gallery, make the prev/next regions inactive (not clickable)
     * and make sure translation is set to 0%
     */
    peekABoo.setupSingleImageGallery = function(){
      $('.js-peekaboo-slide').eq(0).addClass('active'); 
      $pagingGoToPrev.removeClass('active');
      $pagingGoToNext.removeClass('active');
      
      $slideBody.css({
        '-webkit-transition': 'initial',
        'transition': 'initial',     
        '-webkit-transform': 'translate3d(0%, 0, 0)',
        '-ms-transform': 'translate3d(0%, 0, 0)',
        'transform': 'translate3d(0%, 0, 0)'
      });
    };
    
    
    peekABoo.bindPagerDotClicksCircular = function(){
      
    }; 
    
    /**
     * bindPagerDotClicks()    
     * 
     *  TODO - make these work for circular gallery or hide them
     * 
     * bind interactions to the pagination dots.  This method inspects any clicked pager dot
     * to find the target "page number", and then passes that to adjustImageGridRightLeftSlidePos().    
     */
    peekABoo.bindPagerDotClicks = function(){
      
      $pagingDots.on('click', function(e){
                  
        if ( !$(this).hasClass('active') ){  
        
          // momentarily set all paging dots and slides inactive
          $pagingDots.removeClass('active');      
          $slides.removeClass('active');      
                                         
          // figure out what slide we are going to                               
          var numSlides = $(this).attr('data-slide-to'); 
                  
          // go to desired slide
          peekABoo.adjustImageGridRightLeftSlidePos(numSlides); 
          
          // set class of clicked paging dot to active
          $(this).addClass('active');                             
          
          // loop over every slide.  Find the one that matches the 'data-slide-to' target slide, and make sure it's set to active.
          var t = setTimeout(function(){
            for ( var i = numSlides; i < (parseInt(numSlides) + 1); i++){
                          
              $slides.eq(i).addClass('active');  
              peekABoo.loadPeekingSlides();             
            }  
            
            // make sure prev/next regions are set to clickable if necessary
            p.updatePrevNextClickRegions();
          },300);        
          
        } 
        
      }); 
    };
    
    /**
     * adjustImageGridRightLeftSlidePos()
     *  
     * Input:  numSlides - (required) - slide the slides to the left or right by numSlides
     */
    peekABoo.adjustImageGridRightLeftSlidePos = function(numSlides){
      var columnWidth = $slideWindow.width(),
          totalSlideWidth = columnWidth * numSlides;        
          
      $totalSlideWidthPercent = ((totalSlideWidth / $slideWindow.width()) * 100) + 200;
        
      var totalSlideTransformPercent = 'translate3d(' + ($totalSlideWidthPercent * -1) + '%, 0, 0)'; 
             
      $slideBody.css({
        '-webkit-transform': totalSlideTransformPercent,
        '-ms-transform': totalSlideTransformPercent,
        'transform': totalSlideTransformPercent
      });
    };
    
    /**
     * adjustImageGridOnePosition()
     *  
     * this is used after we have moved one position using the prev/next clickable regions
     * to make sure we can chop off the beginning or end slide and append/prepend it to the
     * slideshow without suffering any horizontal wiggle.  Temporarily disable the
     * css transform on the slideBody.
     */
    peekABoo.adjustImageGridOnePosition = function(){
      var initialTransition = $slideBody.css('transition');
    
      $slideBody.css({
        '-webkit-transition': 'initial',
        'transition': 'initial',     
        '-webkit-transform': 'translate3d(-200%, 0, 0)',
        '-ms-transform': 'translate3d(-200%, 0, 0)',
        'transform': 'translate3d(-200%, 0, 0)'
      }); 
      
      setTimeout(function(){      
        $slideBody.css({
          '-webkit-transition': initialTransition,
          'transition': initialTransition
        }); 
      }, settings.animationDuration);
    }; 
    
    /**
     * loadPeekingSlides()
     *  
     * uas we proceed forward in a circular gallery, clone the first slide and move the copy to the
     *  end of the gallery.
     *  as we proceed backwards in a circular gallery, clone the last slide and move the copy to 
     *  the beginning of the gallery. 
     *
     *  Note:  We use .clone() and .append() rather than .remove() and .append() because we need
     *         all the slides to stay in place at the begin/end while we are transitioning in
     *         order to keep the width of slideBody consistent so we can transition by a %.
     *         After we append the cloned slide, we use 'adjustImageGridOnePosition' to 
     *         temporarily remove the transitions on slideBody, and adjust the percentage to
     *         reflect the fact that we are moving a slide from one end of the gallery to the 
     *         other.  'killWrappingSlides' is then used to remove the beginning or end slide
     *
     *  inputs:  direction - (required) - should be set to 'prev' or 'next' 
     */
    peekABoo.loadPeekingSlides = function(direction){
      if ( direction == 'prev' ){
      
        var $lastSlide = $(peekABoo).find('.js-peekaboo-slide').last().clone();
        $slideBody.prepend($lastSlide); 
        
      }
          
      if ( direction == 'next' ) {
        
        var $firstSlide = $(peekABoo).find('.js-peekaboo-slide').eq(0).clone();      
        $slideBody.append($firstSlide); 
        
      }      
    }; 
    
    peekABoo.killWrappingSlides = function(direction){
      if (direction == 'prev'){
        $(peekABoo).find('.js-peekaboo-slide').last().remove();
      }
      if (direction == 'next'){
        $(peekABoo).find('.js-peekaboo-slide').eq(0).remove(); 
      }
    }; 
    
    /**
     * updatePrevNextClickRegions()
     * 
     * manage the clickability of the large prev and next regions to the left and 
     * right of the PDP active image grid. 
     *      
     */
    peekABoo.updatePrevNextClickRegions = function(){
      // Update active state of the prev and next page clickable regions (only used for non-circular galleries)
      if ( !$slides.eq(0).hasClass('active') ){
        $pagingGoToPrev.addClass('active');
      } else {
        $pagingGoToPrev.removeClass('active'); 
      }        
      
      if ( !$slides.last().hasClass('active') ){
        $pagingGoToNext.addClass('active');
      } else {
        $pagingGoToNext.removeClass('active'); 
      }
    };
    
    /**
     * bindPagerPrevNextClicks()
     * 
     * bind interactions to the slider's Prev / Next regions.  (These are the faded regions to the 
     * left and right of the "active" slide that are clickable.)  When clicked they should slide
     * slides left and right across slideWindow
     */ 
    peekABoo.bindPagerPrevNextClicks = function(){
      $pagingGoToPrev.on('click', function(e){      
      
        if ( $(this).hasClass('active') ){
        
          var activeDotNum = $(peekABoo).find('.js-peekaboo-paging-dot.active').attr('data-slide-to'),
              newDotNum = activeDotNum - 1,        
              previousDot = $(peekABoo).find('[data-slide-to=' + newDotNum + ']');       
                
          previousDot.trigger('click'); 
        }
      }); 
      
      $pagingGoToNext.on('click', function(e){
            
        if ( $(this).hasClass('active') ){
        
          var activeDotNum = $(peekABoo).find('.js-peekaboo-paging-dot.active').attr('data-slide-to'),
              newDotNum = parseInt(activeDotNum) + 1,         
              nextDot = $(peekABoo).find('[data-slide-to=' + newDotNum + ']');  
                  
          nextDot.trigger('click'); 
        }
      }); 
    }; 
    
    
    /**
     * bindPagerPrevNextClicksCircular()
     * 
     * uses 'adjustImageGridRightLeftSlidePos()' and 'postMotionUpdateActiveSlide()' methods
     * to move slides back and forth, and update the active slide.
     */
    peekABoo.bindPagerPrevNextClicksCircular = function(){
      $pagingGoToPrev.on('click', function(e){        
      
        var activeSlide = $(peekABoo).find('.js-peekaboo-slide.active');
            activeSlideNum = activeSlide.attr('data-slide-to');
              
        slideToPos = activeSlide.prev().index();
        
        peekABoo.adjustImageGridRightLeftSlidePos( slideToPos - 2 );  
        peekABoo.postMotionUpdateActiveSlide("prev");
         
      }); 
      
      $pagingGoToNext.on('click', function(e){
        
        var activeSlide = $(peekABoo).find('.js-peekaboo-slide.active');
            activeSlideNum = activeSlide.attr('data-slide-to');
              
        slideToPos = activeSlide.next().index();   
        
        peekABoo.adjustImageGridRightLeftSlidePos( slideToPos - 2 );       
        peekABoo.postMotionUpdateActiveSlide("next");
        
      }); 
    }; 
    
    /**
     * postMotionUpdateActiveSlide()
     * 
     * after we have moved the slides horizontally, make sure we set the correct slide and
     * the correct pagination dot to active.
     */
    peekABoo.postMotionUpdateActiveSlide = function(direction){
      var activeSlide = $(peekABoo).find('.js-peekaboo-slide.active'),
          activeSlideNum = activeSlide.attr('data-slide-to'); 
            
      $pagingDots.removeClass('active');      
      $(peekABoo).find('.js-peekaboo-slide').removeClass('active');  
      
      if (direction == "prev"){
        var newActiveSlide = activeSlide.prev(),          
            newActiveSlideIndex = parseInt(activeSlideNum) - 1;
            
        if (newActiveSlideIndex < 0){
          newActiveSlideIndex = originalNumSlides - 1;
        }           
            
      } else if (direction == "next"){
        var newActiveSlide = activeSlide.next(),
            newActiveSlideIndex = parseInt(activeSlideNum) + 1;
            
        if (newActiveSlideIndex > (originalNumSlides - 1)){
          newActiveSlideIndex = 0;
        }
      
      }
      
      newActivePagingDot =  $(peekABoo).find('.js-peekaboo-paging-dot[data-slide-to=' + newActiveSlideIndex + ']');
      
      newActiveSlide.addClass('active');
      newActivePagingDot.addClass('active');   
      
      var t = setTimeout(function(){    
        peekABoo.loadPeekingSlides(direction);  
        peekABoo.adjustImageGridOnePosition(direction);
        peekABoo.killWrappingSlides(direction); 
      }, settings.animationDuration);  
    }; 
    
    
    /* Initialize the Plugin */
    peekABoo.init(); 
  
  }  

}(jQuery)); 
