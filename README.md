# peekaboo
Responsive slideshow based on CSS3 3D transforms, with previous and next slides visible at sides of gallery.

View the demo:  http://zaneray.github.io/peekaboo/


## Configurable Options


### circularSlider

Set **circularSlider** to **true** or **false**.  See demo for example of a circular slider and a non-circular slider.  Default is **true**.


### autostartSlider

Set **autostartSlider** to **true** to automatically start the slide animation when the plugin loads, or **false** to prevent automatically starting slide transitions.  Default is **true**.


### sliderInterval 

The **sliderInterval** corresponds to how long to pause between slide transitions, in milliseconds.  This does not include the time required to complete an animation - it only corresponds to the duration that each slide sits stationary for viewing.  Default is 4000ms.


### sliderDirection

Set **sliderDirection** to **next** or **prev**.  For 'prev' the slider transitions in the direction of the previous slide, e.g. the slide peeking on the left.  For 'next' the slider transitions in the direction of the next slide, e.g. the slide peeking on the right.  Default is **next**.


### stopOnInteraction

Set **stopOnInteraction** to **true** or **false**.  If **true** slider will stop auto-incrementing if a user interacts with the slider's parent element (.js-peekaboo-container).  Default is **true**.


### stopAfterDuration

Use **stopAfterDuration** to specify a duration after which the slider should stop incrementing, in milliseconds.  This is to prevent the slider from continuing to consume resources if a user was viewing the slider in a browser or on a device and then never navigates away.  Default is 30000ms (30 seconds).


### animationDuration

The **animationDuration** should correspond to the duration applied to any CSS transforms used when transitioning a slide ahead one position.  By default, the peekaboo plugin is set up to use a 300ms slide transition.  To update this value, update the 'transition' values in style.css for .peekaboo-slide-body, and update the plugin initialization to use the new value.



## More about transitions and animations

The back-and-forth slide animations achieved here are simply achieved by using CSS3 translate3d(), where the back-and-forth motion is defined in percentages, i.e.

``` css
.peekaboo-slide-body {
  -webkit-transition: all 0.3s ease-in;   // update this to make slide transition faster/slower
  transition: all 0.3s ease-in;           // update this to make slide transition faster/slower
  -webkit-transform: translate3d(-200%, 0, 0);
  transform: translate3d(-200%, 0, 0); 
}
```

To apply an effect to an individual slide as it comes into view, apply those CSS treatments to the **.peekaboo-slide** and **.peekaboo-slide.active** elements.  The **.active** class on **.peekaboo-slide** elements is toggled as they are slid into view.  The default behavior is to apply an opacity transition as the slide comes into view.  The corresponding code from *style.css* is shown below: 

``` css
.peekaboo-slide {
  opacity: 0.1;
  filter: alpha(opacity=10);
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-transition: opacity 0.3s ease-in;   // this should typically match the transition speed on .peekaboo-slide-body
  transition: opacity 0.3s ease-in;           // this should typically match the transition speed on .peekaboo-slide-body
  display: inline-block;
  width: 100% !important;
}
.peekaboo-slide.active {
  opacity: 1;
  filter: alpha(opacity=100);
}
```

If you update the transition rates in the CSS, update the **animationDuration** that is used to initialize the plugin. 



## Example Usage

``` JavaScript
$('[data-peekaboo-parent]').peekABoo({          // init using a jQuery reference. here we've pointed it to the unique data attribute 'data-peekaboo-parent'.  
	circularSlider : true,        // 'true' or 'false'
	autostartSlider : true,       // 'true' or 'false'
	sliderInterval : 4000,        // how long to pause between transitioning to next slide
	sliderDirection : "next",     // 'next' or 'prev'
	stopOnInteraction : true,     // stop moving once someone clicks on the slider's parent element or anything inside it
	stopAfterDuration : 30000,    // gallery will stop autolooping after this duration
	animationDuration : 300       // this should correspond to the timing set up in CSS for the right-to-left slide transform on .peekaboo-slide-body
});
```
