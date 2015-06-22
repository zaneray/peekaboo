<%@ include file="/includes/taglib_inc.jsp" %>

<div class="peekaboo-parent" data-peekaboo-parent>

	<div class="js-peekaboo-container peekaboo-container container">

		<div class="peekaboo-window js-peekaboo-window">

			<!-- clickable faded prev/next regions -->
			<div class="js-peekaboo-pager-prev peekaboo-pager-prev peekaboo-pager active">
			  <div class="peekaboo-pager-arrow-left">
			    <span class="icon icon-chevron-thin-left"></span>
			  </div> 			
			</div>
			<div class="js-peekaboo-pager-next peekaboo-pager-next peekaboo-pager active">
			  <div class="peekaboo-pager-arrow-right">
			    <span class="icon icon-chevron-thin-right"></span>
			  </div>
			</div>

			<!-- this is the actual image slider.  construct your images here.  -->
			<div class="js-peekaboo-slide-body peekaboo-slide-body"> <%--TODO: right arrow icon --%>				
				
				<%-- load hero image slides --%>
				<c:forEach items="${articlesMap.heroSlides}" var="heroArt" varStatus="status">
				  <span class="js-peekaboo-slide peekaboo-slide" data-slide-to="${status.index}">
            <img src="${av.imageURL}${heroArt.img.HERO.relative_url}/${heroArt.img.HERO.filename}" />
            <div class="hero-slide-copy">${heroArt.attr.HERO_COPY}${heroArt.attr.HERO_BUTTON_LABEL}</div>
          </span>
				  
				</c:forEach>
				
				
			</div>

			<!-- optional paging dots -->
			<%--
      <ul class="js-peekaboo-paging-dots peekaboo-paging-dots">
          <li class="js-peekaboo-paging-dot peekaboo-paging-dot active" data-slide-to="0">&deg;</li>
          <li class="js-peekaboo-paging-dot peekaboo-paging-dot" data-slide-to="1">&deg;</li>
          <li class="js-peekaboo-paging-dot peekaboo-paging-dot" data-slide-to="2">&deg;</li>
          <li class="js-peekaboo-paging-dot peekaboo-paging-dot" data-slide-to="3">&deg;</li>       
      </ul>     
       --%>
		</div>
	</div>
</div>



<c:set var="additionalJS" scope="request">${additionalJS}

	$('[data-peekaboo-parent]').peekABoo({          // init using a jQuery reference. here I've pointed it to the unique data attribute 'data-peekaboo-parent'.  
	  circularSlider : true,        // 'true' or 'false'
	  autostartSlider : true,       // 'true' or 'false'
	  sliderInterval : 4000,        // how long to pause between transitioning to next slide
	  sliderDirection : "next",     // 'next' or 'prev'
	  stopOnInteraction : true,     // stop moving once someone clicks on the slider's parent element or anything inside it
	  stopAfterDuration : 30000,    // gallery will stop autolooping after this duration
	  animationDuration : 300       // this should correspond to the timing set up in CSS for the right-to-left slide transform
	});
	
</c:set>