(function($) {

  $.fn.peekABoo = function( options ) {
  
    var settings = $.extend({
      
      circularSlider : true,
      autostartSlider : true,      
      sliderInterval : 4000,
      sliderDirection : "next",
      stopOnInteraction : true,
      stopAfterDuration : 30000,
      animationDuration : 300,
      startPositionNonCircular : 0
      
    }, options); 
  
    var peekABoo = this,
        $slideWindow = $(this).find('.js-peekaboo-window'),
        $slideBody = $(this).find('.js-peekaboo-slide-body'),
        $slides = $(this).find('.js-peekaboo-slide'),
        $pagingDots = $(this).find('.js-peekaboo-paging-dot'),
        $pagingGoToPrev = $(this).find('.js-peekaboo-pager-prev'),
        $pagingGoToNext = $(this).find('.js-peekaboo-pager-next'),
        originalNumSlides = $(this).find('.js-peekaboo-slide').length,
        originalTransitionCSS = $(this).find('.js-peekaboo-slide-body').css('transition'); 
     

    /* init()
     * 
     * The main init function.
     * Here we consume all the settings and set things in motion.
     */
    peekABoo.init = function(){
      
      if ($slides.length > 1){      
      
        // initialize for circular slideshow
        if (settings.circularSlider == true){
          
          peekABoo.startSlideIndex = 2; 
          
          peekABoo.makeCircular();
          peekABoo.bindPagerPrevNextClicksCircular();
          peekABoo.bindPagerDotClicksCircular();       
          
        // initialize for non-circular slideshow
        } else {
          
          if (typeof settings.startPositionNonCircular !== 'undefined'){
            peekABoo.startSlideIndex = settings.startPositionNonCircular; 
          } else {
            peekABoo.startSlideIndex = 0; 
          }
          
          peekABoo.makeNonCircular(peekABoo.startSlideIndex); 
          peekABoo.updatePrevNextClickRegions(); 
          peekABoo.bindPagerPrevNextClicks();
          peekABoo.bindPagerDotClicks(); 
        }      
        
        // autostart
        if (settings.autostartSlider == true){
          peekABoo.autoStart(settings.sliderInterval, settings.sliderDirection, settings.stopOnInteraction, settings.stopAfterDuration)  
        }  

        
        // Attach mouse and touch events for swipe / drag   
        $slideBody.on('mousedown touchstart', function(e){      

          peekABoo.startTime = new Date().getTime();
                          
          if (e.type == 'mousedown'){
            peekABoo.dragStartMousePosX = peekABoo.getMousePos(e).posx;
          }
          
          if (e.type == 'touchstart'){
            peekABoo.dragStartMousePosX = e.originalEvent.touches[0].pageX;
          }

          // For circular slider, we can slide infinitely in either direction
          if (settings.circularSlider == true){
            peekABoo.dragStartCircular(e);
            
          // For non-circular slide, we have to manage the left and right ends of the gallery and unbind the swipe events
          } else {
            peekABoo.dragStart(e);  
          }        

        });          
        
        
      // don't init much if there is only one image in the gallery
      } else {
        peekABoo.setupSingleImageGallery();      
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
      
      $slideBody.css({
        '-webkit-transition': 'initial',
        'transition': 'initial',   
      }); 
      
      setTimeout(function(){      
        $slideBody.css({
          '-webkit-transition': originalTransitionCSS,
          'transition': originalTransitionCSS
        });                 
      }, settings.animationDuration);
            
      peekABoo.adjustImageGridRightLeftSlidePos(0);
    
    };

    
    /**
     * makeNonCircular()
     *
     * For a non-circular slider, we dont have to append/prepend any extra slides, but we 
     * can use "startSlideIndex" to specify where the slideshow should start.  
     * For example, startSlideIndex=1 would make it so that the slideshow starts on the
     * second slide, with the second pagination dot active, giving the appearance that 
     * there are peekaboo slides before and after the starting slide.
     *
     */     
    peekABoo.makeNonCircular = function(startSlideIndex){      
      $(peekABoo).find('.js-peekaboo-slide').eq(startSlideIndex).addClass('active');            
      
      $slideBody.css({     
        '-webkit-transform': 'translate3d(' + startSlideIndex * 100 + '%, 0, 0)',
        '-ms-transform': 'translate3d(' + startSlideIndex * 100 + '%, 0, 0)',
        'transform': 'translate3d(' + startSlideIndex * 100 + '%, 0, 0)'
      });
      
    }; 
    
    
    /**
     * autoStart()
     *
     * if specified in the settings (autostart = true), click through the gallery at a specified
     * interval.  we accomplish this by triggering clicks on the 'prev' and 'next' clickable elements.
     * autoplay direction is specified in settings as "prev" or "next"
     * if specified in the settings, we can disable the autoplay after "stopAfterDuration" milliseconds
     * if specified in the settings, we can disable autoplay after a user interacts w/ the gallery.
     */
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
        $(peekABoo).find('.js-peekaboo-container').on('click touchstart', function(e){
                    
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
      $(peekABoo).find('.js-peekaboo-slide').eq(0).addClass('active'); 
      $pagingGoToPrev.removeClass('active');
      $pagingGoToNext.removeClass('active');
            
      $pagingGoToNext.remove();
      $pagingGoToPrev.remove();
      $pagingDots.remove();      
            
      $slideBody.css({
        '-webkit-transition': 'initial',
        'transition': 'initial',     
        '-webkit-transform': 'translate3d(0%, 0, 0)',
        '-ms-transform': 'translate3d(0%, 0, 0)',
        'transform': 'translate3d(0%, 0, 0)'
      });
    };
    
    
    peekABoo.bindPagerDotClicksCircular = function(){
           
      $pagingDots.on('click', function(e){

        if ( !$(this).hasClass('active') ){
          
          // momentarily set all paging dots and slides inactive
          
          var activeSlideDotIndex = $(peekABoo).find('.js-peekaboo-paging-dot.active').attr('data-slide-to'),
              targetSlideDotIndex = $(this).attr('data-slide-to'),
              $candidateSlides = $(peekABoo).find('.js-peekaboo-slide[data-slide-to=' + targetSlideDotIndex + ']'),
              activePosition = $(peekABoo).find('.js-peekaboo-slide.active').index(),              
              numSlides = 9999999,
              finalPosition = -1; 
                      
          $pagingDots.removeClass('active');      
          $(peekABoo).find('.js-peekaboo-slide').removeClass('active');  
            
          $.each ( $candidateSlides, function(index) {
            
            var candidatePosition = $(this).index(),                
                positionDelta = candidatePosition - activePosition;                 
                
            if ( Math.abs(positionDelta) < Math.abs(numSlides) && candidatePosition != 0 && candidatePosition != ($('.js-peekaboo-slide').length - 1) ){
              numSlides = positionDelta; 
              finalPosition = candidatePosition;
            }                
            
          });           
          
          $(this).addClass('active');    
          
          peekABoo.adjustImageGridRightLeftSlidePos(numSlides); 
                     
          if (numSlides > 0){
            var direction = 'next';
          } else if (numSlides < 0){
            var direction = 'prev';
          }
          
          var t = setTimeout(function(){
          
            for (i = 0; i < Math.abs(numSlides); i++){
              peekABoo.loadPeekingSlides(direction);      
              peekABoo.adjustImageGridOnePosition(direction);            
              peekABoo.killWrappingSlides(direction);               
            }
            
            $(peekABoo).find('.js-peekaboo-slide[data-slide-to=' + targetSlideDotIndex + ']').eq(0).addClass('active'); 
            $(peekABoo).removeClass('peekaboo-notransition');
          
          }, settings.animationDuration );  
          
          
        }

      });      
    }; 
    
    
    /**
     * bindPagerDotClicks()    
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
              
            }  
            
            // make sure prev/next regions are set to clickable if necessary
            peekABoo.updatePrevNextClickRegions();
            $(peekABoo).removeClass('peekaboo-notransition');
          }, settings.animationDuration);        
          
        } 
        
      }); 
    };
    
    
    /**
     * adjustImageGridRightLeftSlidePos()
     *  
     * Input:  numSlides - (required) - slide the slides to the left or right by numSlides
     *
     * Note: this method is used for circular and non-circular galleries.  
     * Note: the left offset is computed using the "startSlideIndex" to know where the "first" slide
     *       sits.  For example, with a circular gallery, after we clone and then append/prepend
     *       slides, we have to offset the gallery by -200% to make the "first" slide visible.  We 
     *       keep track of that -200% throughout the gallery.  
     */
    peekABoo.adjustImageGridRightLeftSlidePos = function(numSlides){
      var columnWidth = $slideWindow.width(),
          totalSlideWidth = columnWidth * numSlides;        
                    
      $totalSlideWidthPercent = ((totalSlideWidth / $slideWindow.width()) * 100) + (100 * peekABoo.startSlideIndex);
        
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
          
      $slideBody.css({
        '-webkit-transition': 'initial',
        'transition': 'initial',     
        '-webkit-transform': 'translate3d(-200%, 0, 0)',
        '-ms-transform': 'translate3d(-200%, 0, 0)',
        'transform': 'translate3d(-200%, 0, 0)'
      }); 
      
      setTimeout(function(){      
        $slideBody.css({
          '-webkit-transition': originalTransitionCSS,
          'transition': originalTransitionCSS
        }); 
        
        $(peekABoo).removeClass('peekaboo-notransition');
                
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
    
    
    /**
     * killWrappingSlides()
     *
     * used after a circular slide transition to make sure we crop the extra slide added to the
     * beginning or end of the gallery off to get us back to the correct number of slides.     
     */     
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
            
        if ( $(peekABoo).hasClass('peekaboo-notransition') == false ){
          $(peekABoo).addClass('peekaboo-notransition');
        }
        else {
          return;
        }    
            
        if ( $(this).hasClass('active') ){
        
          var activeDotNum = $(peekABoo).find('.js-peekaboo-paging-dot.active').attr('data-slide-to'),
              newDotNum = activeDotNum - 1,        
              previousDot = $(peekABoo).find('[data-slide-to=' + newDotNum + ']');       
                      
          previousDot.trigger('click'); 
        }
        else {
          $(peekABoo).removeClass('peekaboo-notransition');
        }
      }); 
      
      $pagingGoToNext.on('click', function(e){
               
        if ( $(peekABoo).hasClass('peekaboo-notransition') == false ){
          $(peekABoo).addClass('peekaboo-notransition');
        }
        else {
          return;
        }      
            
        if ( $(this).hasClass('active') ){          
        
          var activeDotNum = $(peekABoo).find('.js-peekaboo-paging-dot.active').attr('data-slide-to'),
              newDotNum = parseInt(activeDotNum) + 1,         
              nextDot = $(peekABoo).find('[data-slide-to=' + newDotNum + ']'); 
                  
          nextDot.trigger('click'); 
        }
        else {
          $(peekABoo).removeClass('peekaboo-notransition');
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
      
        if ( $(peekABoo).hasClass('peekaboo-notransition') == false ){
          $(peekABoo).addClass('peekaboo-notransition');
        }
        else {
          return;
        }
      
        var activeSlide = $(peekABoo).find('.js-peekaboo-slide.active');
            activeSlideNum = activeSlide.attr('data-slide-to');
              
        slideToPos = activeSlide.prev().index();
        
        peekABoo.adjustImageGridRightLeftSlidePos( slideToPos - 2 );  
        peekABoo.postMotionUpdateActiveSlide("prev");
         
      }); 
      
      $pagingGoToNext.on('click', function(e){
        
        if ( $(peekABoo).hasClass('peekaboo-notransition') == false ){
          $(peekABoo).addClass('peekaboo-notransition');
        }
        else {
          return;
        }
        
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
     * after we have moved the slides horizontally one position, make sure we set the correct slide and
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
        
        $(peekABoo).removeClass('peekaboo-notransition');
      }, settings.animationDuration);  
    }; 
    
        
    /** 
     *  Image Grid swipe / touch interactions
     * 
     * the functions below are used for the mobile / touch interactions with the image grid 
     * pagination.  
     */
     
    /* Start logic for swipe */
    peekABoo.dragStart = function(e){
        
      peekABoo.fastSwipeTimerStart= new Date().getTime();
        
      if (e.type == 'mousedown'){
        $(document).on('mousemove.swipe', function(e){
          peekABoo.dragMove(e);
        });
        $(document).on('mouseup.swipe', function(e){        
          peekABoo.dragEnd(e);
        });
      }

      if (e.type == 'touchstart'){
        peekABoo.dragStartMousePosY = e.originalEvent.touches[0].pageY;
        $slideBody.on('touchmove', function(e){
          peekABoo.dragMove(e);
        });
      
        $slideBody.on('touchend', function(e){        
          peekABoo.dragEnd(e);
        });
      }
      
    };
    peekABoo.dragStartCircular = function(e){
        
      peekABoo.fastSwipeTimerStart= new Date().getTime();
        
      if (e.type == 'mousedown'){
        $(document).on('mousemove.swipe', function(e){
          peekABoo.dragMoveCircular(e);
        });
        $(document).on('mouseup.swipe', function(e){        
          peekABoo.dragEndCircular(e);
        });
      }

      if (e.type == 'touchstart'){
        peekABoo.dragStartMousePosY = e.originalEvent.touches[0].pageY;
        $slideBody.on('touchmove', function(e){
          peekABoo.dragMoveCircular(e);
        });
      
        $slideBody.on('touchend', function(e){        
          peekABoo.dragEndCircular(e);
        });
      }
      
    };
      
    peekABoo.getMousePos = function(e){
      var posx,
          posy;
          
      if (!e) var e = window.event;
      if (e.pageX || e.pageY)   {
        posx = e.pageX;
        posy = e.pageY;
      }
      else if (e.clientX || e.clientY)  {
        posx = e.clientX + document.body.scrollLeft
        + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop
        + document.documentElement.scrollTop;
      }
      return {
        'posx': posx,
        'posy': posy
      };  
    };
      
    peekABoo.dragMove = function(e){

      // remove transition effect 
      $slideBody.addClass('peekaboo-notransition');

      peekABoo.fastSwipeTimerEnd = new Date().getTime();

      if (e.type == 'mousemove'){
        dragDistanceX = peekABoo.dragStartMousePosX - peekABoo.getMousePos(e).posx;
      }

      if (e.type == 'touchmove'){
        dragDistanceX = peekABoo.dragStartMousePosX - e.originalEvent.touches[0].pageX;
        peekABoo.mouseUpEndX = e.originalEvent.touches[0].pageX;

        dragDistanceY = peekABoo.dragStartMousePosY - e.originalEvent.touches[0].pageY;
        window.scrollBy(0,dragDistanceY);   
      }

      // % / pixel
      var pixelPercentValue = 100 / $slideWindow.width(),
          moveByPercent = dragDistanceX * pixelPercentValue;
      
      if (peekABoo.totalSlideWidthPercent === undefined){
        peekABoo.totalSlideWidthPercent = 0;
      }

      // current % position
      peekABoo.moveByPercentTotal = peekABoo.totalSlideWidthPercent * -1 - moveByPercent;

      // disable further left
      if (peekABoo.moveByPercentTotal >= 0){
        return false;
      }

      var totalSlideTransformPercent = 'translate3d(' + peekABoo.moveByPercentTotal - 200 + '%, 0, 0)';    
      
      $slideBody.css({
        '-webkit-transform': totalSlideTransformPercent,
        '-ms-transform': totalSlideTransformPercent,
        'transform': totalSlideTransformPercent
        }
      );
      
    };
    
    peekABoo.dragMoveCircular = function(e){
      // remove transition effect 
      $slideBody.addClass('peekaboo-notransition');

      peekABoo.fastSwipeTimerEnd = new Date().getTime();

      if (e.type == 'mousemove'){
        dragDistanceX = peekABoo.dragStartMousePosX - peekABoo.getMousePos(e).posx;
      }

      if (e.type == 'touchmove'){
        dragDistanceX = peekABoo.dragStartMousePosX - e.originalEvent.touches[0].pageX;
        peekABoo.mouseUpEndX = e.originalEvent.touches[0].pageX;

        dragDistanceY = peekABoo.dragStartMousePosY - e.originalEvent.touches[0].pageY;
        window.scrollBy(0,dragDistanceY);   
      }

      // % / pixel
      var pixelPercentValue = 100 / $slideWindow.width(),
          moveByPercent = dragDistanceX * pixelPercentValue;
      
      if (peekABoo.totalSlideWidthPercent === undefined){
        peekABoo.totalSlideWidthPercent = 0;
      }

      // current % position
      peekABoo.moveByPercentTotal = peekABoo.totalSlideWidthPercent * -1 - moveByPercent - 200;
      
      var totalSlideTransformPercent = 'translate3d(' + peekABoo.moveByPercentTotal + '%, 0, 0)';            
      
      $slideBody.css({
        '-webkit-transform': totalSlideTransformPercent,
        '-ms-transform': totalSlideTransformPercent,
        'transform': totalSlideTransformPercent
        }
      );
      
    };
      
    peekABoo.dragEnd = function(e){

      $(document).off('mousemove.swipe');
      $(document).off('mouseup.swipe');
      
      $slideBody.off('touchmove');
      $slideBody.off('touchend');
      
      $slideBody.removeClass('peekaboo-notransition'); 

      if (e.type == 'mouseup'){
        peekABoo.mouseUpEndX = peekABoo.getMousePos(e).posx;
      }

      peekABoo.swipeSlide();     

    };
    peekABoo.dragEndCircular = function(e){
      $(document).off('mousemove.swipe');
      $(document).off('mouseup.swipe');
      
      $slideBody.off('touchmove');
      $slideBody.off('touchend');
      
      $slideBody.removeClass('peekaboo-notransition'); 

      if (e.type == 'mouseup'){
        peekABoo.mouseUpEndX = peekABoo.getMousePos(e).posx;
      }

      peekABoo.swipeSlide(); 
    }; 

    peekABoo.slideToStart = function(){
            
      var totalSlideTransformPercent = 'translate3d(' + peekABoo.totalSlideWidthPercent * -1 - 200 + '%, 0, 0)';    

      $slideBody.css({
        '-webkit-transform': totalSlideTransformPercent,
        '-ms-transform': totalSlideTransformPercent,
        'transform': totalSlideTransformPercent
        }
      );      

    };
      
    peekABoo.swipeSlide = function(){

      peekABoo.endTime = new Date().getTime();
    
      if (peekABoo.endTime - peekABoo.startTime < 150) {      
        return false;
      }

      if ((peekABoo.dragStartMousePosX - peekABoo.mouseUpEndX) >= 8){
        $pagingGoToNext.trigger('click');
        return false;
      }

      if ((peekABoo.mouseUpEndX - peekABoo.dragStartMousePosX) >= 8){
        $pagingGoToPrev.trigger('click');
        return false;
      }

      peekABoo.slideToStart();

    } ;
    /** 
     * END - Image Grid swipe / touch interactions 
     */
        
    
    /* Initialize the Plugin */
    peekABoo.init(); 
  
  };

}(jQuery)); 
