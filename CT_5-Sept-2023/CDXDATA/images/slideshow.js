var g_viewerOverlay;
window.addEvent('domready', function(){
	g_viewerOverlay = new SlideShow();
});

var SlideShow = new Class({
	//detect if the overlay is on
	isViewingStudy : false,
	//the current slides for the current series
	slides : {},
	//indices of the last processed image, per study and series
	lastViewedSeries : {},
	lastViewedImage : {},
	currentSlide : null,
	currentStudyElementId : null,
	currentSeriesElementId : null,
	currStudyReports : [],
	MAX_VISIBLE_PREVIEW_SERIES : 3,
	seriesPreviewVisibleIndices : {},
	//our currently shown image
	image : new Element('img'),
	
	initialize : function(){
		//collect our variables
		this.imageViewerDiv = $('imageViewer-div');
		this.mainScreenDiv = $('mainScreen-div');
		this.viewerPane = $('imageViewer-viewPane');
		this.body = $('image-body-table-cell');
		this.patientStudyInfoCell = $('PatientStudyInfoCell');
		this.seriesPaneDiv = $('imageViewer-seriesPane');

		this.slidesCount = $('total-pages');
		this.currentSlideInput = $('current-page');
		//add the image as a child of the content
		this.body.grab(this.image);
			
		this.attachStudyEvents();
		this.attachInputEvents();
		this.attachButtonEvents();
		this.initViewerElements();
		this.attachDocumentEvents();
	},
	
	attachStudyEvents : function(){
		$$('.unselected').each(function(study){
			study.setStyle('cursor', 'pointer');
			var studyElementId = study.id;
			//init last-viewed image # tracking
			this.lastViewedImage[studyElementId] = {};
			this.lastViewedSeries[studyElementId] = "series0";
			
			study.addEvents({
				'click': function(){
					this.viewStudy(studyElementId);
				}.bind(this),
				
				'mouseenter': function(){
					study.addClass('selected');
				}.bind(this),
				
				'mouseleave': function(){
					study.removeClass('selected');
				}.bind(this)
			});
		}.bind(this));
		
	},
	
	initViewerElements : function(){
		$$('.seriesPreviewCell').each(function(seriesPreviewCell){
			var studyElementId = seriesPreviewCell.id.split("_")[0]
			var seriesElementId = seriesPreviewCell.id.split("_")[1]
			// init last-viewed image # for each series
			this.lastViewedImage[studyElementId][seriesElementId] = 0;
			
			seriesPreviewCell.addClass("seriesPreviewCellHidden");
			
			seriesPreviewCell.addEvents({
				'click': function(){
					this.lastViewedSeries[studyElementId] = seriesElementId;
					this.viewStudy(studyElementId);
				}.bind(this),
				
				'mouseenter': function(event){
					pos = seriesPreviewCell.getPosition()
					$('tooltip-div').setStyle('top', pos.y);
					$('tooltip-div').setStyle('left', pos.x + 150);

					// get the HTML content of the first child div of the seriesPreviewCell
					$('tooltip-div').set('html', seriesPreviewCell.getChildren('div')[0].get('html'));
					if($('tooltip-div').getSize().x > 180)
					{
						// only display tooltip if the series desc is too wide
						$('tooltip-div').setStyle('visibility', 'visible');
					}
				}.bind(this),
				
				'mouseleave': function(){
					$('tooltip-div').setStyle('visibility', 'hidden');
				}.bind(this)
			});
			
			if(!this.seriesPreviewVisibleIndices[studyElementId])
			{
				this.seriesPreviewVisibleIndices[studyElementId] = 0;
				this.setFirstVisibleSeriesPreviewCell(studyElementId, this.seriesPreviewVisibleIndices[studyElementId]);
			}
		}.bind(this));
		
		this.patientStudyInfoCell.addEvents({
			'mouseenter': function(event){
				pos = this.patientStudyInfoCell.getPosition()
				$('tooltip-div').setStyle('top', pos.y + 40);
				$('tooltip-div').setStyle('left', pos.x);

				$('tooltip-div').set('html', this.patientStudyInfoCell.get('html'));
				if($('tooltip-div').getSize().x > 525)
				{
					// only display tooltip if the patient/study info is too wide
					$('tooltip-div').setStyle('visibility', 'visible');
				}
				/*
				*/
			}.bind(this),
			
			'mouseleave': function(){
				$('tooltip-div').setStyle('visibility', 'hidden');
			}.bind(this)
		});
		
		this.hideViewerDiv()
	},
	
	attachInputEvents : function(){
		this.currentSlideInput.addEvents({
			'focus': function(e){
				this.currentSlideInput.select();
			}.bind(this),
			
			'keydown': function(e){
				if(e.key == 'enter')
				{
					//check if the page is in range
					var value = this.currentSlideInput.get('value').toInt();
					this.setCurrentSlide(value-1);
				}
			}.bind(this),
			
			'change': function(e){
				$$('.image-nav-button').each(function(btn){
					btn.removeClass('disabled');
				});
				
				var maxSlideIndex = Object.getLength(this.slides)-1;
				if(this.currentSlide == 0)
				{
					//the prev and first buttons disabled
					$('firstslide-btn').addClass('disabled');
					$('prevslide-btn').addClass('disabled');
				}
				if(this.currentSlide == maxSlideIndex)
				{
					$('nextslide-btn').addClass('disabled');
					$('lastslide-btn').addClass('disabled');
				}
				if(maxSlideIndex == 0 || this.getCurrentSeriesMidlineSlideNum() == this.currentSlide)
				{
					$('midslide-btn').addClass('disabled');
				}
				
				//update the image
				$$('.image-nav-button').each(function(btn){
					this.handleButtonImgState(btn);
				}.bind(this));
			}.bind(this)
		})
	},
	
	
	attachButtonEvents : function(){
		// assign actions for buttons
		$$('.image-nav-button').each(function(btn){
			
			var buttonImgFilename = btn.src;
			var extIndex = buttonImgFilename.lastIndexOf('.');
			var buttonOnImgFilename = buttonImgFilename.substring(0, extIndex)+'-on'+buttonImgFilename.substr(extIndex);
			
			btn.addEvents({
				'mousedown':function(){
					//if disabled, do nothing
					if(btn.hasClass('disabled'))
					{
						return;
					}
					btn.set('src', buttonOnImgFilename);
				},
			
				'mouseup':function(){
					//if disabled, do nothing
					if(btn.hasClass('disabled'))
					{
						return;
					}
					btn.set('src', buttonImgFilename);
					
					if(btn.id == 'firstslide-btn')
					{
						this.setCurrentSlide(0);
					}
					else if(btn.id == 'prevslide-btn')
					{
						this.setCurrentSlide(this.currentSlide-1);
					}
					else if(btn.id == 'nextslide-btn')
					{
						this.setCurrentSlide(this.currentSlide+1);
					}
					else if(btn.id == 'midslide-btn')
					{
						this.setCurrentSlide(this.getCurrentSeriesMidlineSlideNum());
					}
					else if(btn.id == 'lastslide-btn')
					{
						this.setCurrentSlide(Object.getLength(this.slides)-1);
					}
				}.bind(this)
			})
		}.bind(this));
		
		$$('scrollSeriesUp','scrollSeriesDown').each(function(btn){
			btn.addEvents({
				'mousedown':function(){
					if(btn.hasClass('disabled'))
					{
						return;
					}
					
					btn.addClass('image-on');
					this.handleButtonImgState(btn);
				}.bind(this),
			
				'mouseup':function(){
					this.handleSeriesScrollButton(btn);
				}.bind(this)
			})
		}.bind(this));

	},
	
	attachDocumentEvents : function(){
		//key events when the slide is currently displaying
		$(document).onkeyup = function(e){
			e = new DOMEvent(e);
			if(this.isViewingStudy)
			{
				if(e.key == 'esc')
				{
					this.hideViewerDiv();
				}
				else
				{
					// don't browse left/right if the user is typing in the current page text box
					if(document.activeElement != $("current-page"))
					{
						if(e.key == 'right')
						{
							this.setCurrentSlide(this.currentSlide+1);
						}
						else if(e.key == 'left')
						{
							this.setCurrentSlide(this.currentSlide-1);
						}
					}
				}
			}
		}.bind(this);
		
		var mouseWheelEvent = function(e){
			e = new DOMEvent(e);
			//if(this.isViewingStudy)
			if(this.isViewingStudy)
			{
				e.preventDefault(); // don't scroll the webpage up or down
				if(e.wheel > 0) // UP == BACK
				{
					this.setCurrentSlide(this.currentSlide-1);
				}
				else if(e.wheel < 0) // DOWN == FORWARD
				{
					this.setCurrentSlide(this.currentSlide+1);
				}
			}
		}.bind(this);
		document.addEvent('mousewheel', mouseWheelEvent);
		
	},
	
	handleButtonImgState : function(btn){
		var currentButtonImgFilename = btn.src;
		var extIndex = currentButtonImgFilename.lastIndexOf('.');
		var extension = currentButtonImgFilename.substr(extIndex);
		var imgBaseName = currentButtonImgFilename.substring(0, extIndex).replace('-disabled', '').replace('-on', '');
		var buttonImgFilename = imgBaseName + extension;
		var buttonOnImgFilename = imgBaseName + '-on' + extension;
		var buttonDisabledImgFilename = imgBaseName + '-disabled' + extension;
		
		if(btn.hasClass('image-on'))
		{
			btn.set('src', buttonOnImgFilename);
		}
		else if(btn.hasClass('disabled'))
		{
			btn.set('src', buttonDisabledImgFilename);
		}
		else
		{
			btn.set('src', buttonImgFilename);
		}
	},
	
	handleSeriesScrollButton : function(btn){
		//if disabled, do nothing
		if(btn.hasClass('disabled'))
		{
			return;
		}
		
		btn.removeClass('image-on');
		this.handleButtonImgState(btn);
		
		if(btn.id == 'scrollSeriesUp')
		{
			this.scrollVisibleSeriesPreviewCells(this.currentStudyElementId, -1);
		}
		else if(btn.id == 'scrollSeriesDown')
		{
			this.scrollVisibleSeriesPreviewCells(this.currentStudyElementId, 1);
		}
		
		var lastSeriesIndex = this.getLastVisbleSeriesIndex(this.currentStudyElementId);
		$$('scrollSeriesUp','scrollSeriesDown').each(function(btn){
			btn.removeClass('disabled');
			if(this.seriesPreviewVisibleIndices[this.currentStudyElementId] == 0)
			{
				$('scrollSeriesUp').addClass('disabled');
			}
			if(this.seriesPreviewVisibleIndices[this.currentStudyElementId] == lastSeriesIndex)
			{
				$('scrollSeriesDown').addClass('disabled');
			}
			this.handleButtonImgState(btn);
		}.bind(this));
	},
	
	setCurrentSlide : function(value){
		if(isNaN(value) || value<0 || value>Object.getLength(this.slides)-1)
		{
			// no-op due to invalid input
			this.currentSlideInput.set('value', this.currentSlide+1);
		}
		else
		{
			this.currentSlide = value;
			
			this.lastViewedImage[this.currentStudyElementId][this.currentSeriesElementId] = this.currentSlide;
			this.image.src = this.slides["image"+this.currentSlide].filename;
			
			$('warningTextCell').innerHTML = 
				true == this.slides["image"+this.currentSlide].isMultiframe
					? "<strong>WARNING: This image is the middle frame of a multi-frame image.  Multi-frame images are not supported by this viewer.</strong>"
					: "&nbsp;";

			this.currentSlideInput.set('value', this.currentSlide + 1);
			this.currentSlideInput.fireEvent('change');
		}
	},
	
	viewStudy : function(studyElementId){
		//make the current id the study id
		this.currentStudyElementId = studyElementId;
		this.currentSeriesElementId = this.lastViewedSeries[studyElementId];
		this.selectCurrentSeriesPreviewCell();
		var study = studies[studyElementId];
		
		var patientStudyInfoHtml = study.patientName + ",&nbsp;" + study.patientId + ",&nbsp;" + study.patientDob + ",&nbsp;" + study.patientSex + "<BR />" + 
			(study.accessionNumber == '' ? "" : (study.accessionNumber + ",&nbsp;")) + study.studyDate + (study.studyDescription == "" ? "" : (",&nbsp;" + study.studyDescription));
		this.patientStudyInfoCell.set('html', patientStudyInfoHtml);
		
		this.currStudyReports = [];
		currReport = 0;
		Object.each(studies[this.currentStudyElementId].reports, function(currReportSeries){
			Object.each(currReportSeries.instances, function(currInstance){
				if(currInstance.isReport)
				{
					this.currStudyReports[currReport] = currInstance.filename;
					currReport++;
				}
			}.bind(this))
		}.bind(this));
		
		$('reportListForCurrStudy').set('html', study.hasReport ? (
			Object.getLength(this.currStudyReports) > 1 ? 
				'<a href="javascript:g_viewerOverlay.toggleReports();">Reports</a>' 
				: '<a href="' + this.currStudyReports[0] + '" target="_blank">Report</a>')
			: ''); 
		
		//set our current list of slides as all the slides in this series
		this.slides = studies[studyElementId].series[this.currentSeriesElementId].images;
		this.setCurrentSlide(this.lastViewedImage[studyElementId][this.currentSeriesElementId]);
		this.slidesCount.innerHTML = Object.getLength(this.slides);
		
		$$('.imageViewer-seriesPane-study').each(function(studySeriesPane){
			var isCurrStudy = (studySeriesPane.id.split("_")[0] == studyElementId);
			studySeriesPane.setStyle('display', (isCurrStudy ? 'block' : 'none'));
		}.bind(this));
		
		$('scrollSeriesUp').setStyle('display', 'none');
		$('scrollSeriesDown').setStyle('display', 'none');
		if(Object.getLength(studies[studyElementId].series) > this.MAX_VISIBLE_PREVIEW_SERIES)
		{
			$('scrollSeriesUp').setStyle('display', 'block');
			$('scrollSeriesDown').setStyle('display', 'block');
			$('scrollSeriesUp').removeClass('disabled');
			$('scrollSeriesDown').removeClass('disabled');

			var lastSeriesIndex = this.getLastVisbleSeriesIndex(studyElementId);
			if(this.seriesPreviewVisibleIndices[studyElementId] == 0)
			{
				$('scrollSeriesUp').addClass('disabled');
			}
			else if(this.seriesPreviewVisibleIndices[studyElementId] == lastSeriesIndex)
			{
				$('scrollSeriesDown').addClass('disabled');
			}
			this.handleButtonImgState($('scrollSeriesUp'));
			this.handleButtonImgState($('scrollSeriesDown'));
		}
		
		this.imageViewerDiv.setStyle('visibility', 'visible');
		this.mainScreenDiv.setStyle('visibility', 'hidden');
		this.isViewingStudy = true;				
	},
	
	hideViewerDiv : function(){
		$$('.imageViewer-seriesPane-study').each(function(studySeriesPane){
			studySeriesPane.setStyle('display', 'none');
		}.bind(this));
		$('scrollSeriesUp').setStyle('display', 'none');
		$('scrollSeriesDown').setStyle('display', 'none');
		this.mainScreenDiv.setStyle('visibility', 'visible');
		$('reportList-div').setStyle('visibility', 'hidden');
		this.imageViewerDiv.setStyle('visibility', 'hidden');
		this.isViewingStudy = false;
	},
	
	toggleReports : function(){
		if($('reportList-div').getStyle('visibility') == 'visible')
		{
			$('reportList-div').setStyle('visibility', 'hidden');
		}
		else
		{
			currReport = 0;
			reportListHtml = "";
			Object.each(this.currStudyReports, function(reportFilename){
				currReport++;
				reportListHtml += '<a href="' + reportFilename + '" target="_blank">Patient Report #' + currReport + '</a><br />\r\n';
			});
			
			$('reportList-div').set('html', reportListHtml);
			$('reportList-div').setStyle('visibility', 'visible');
		}
	},
	
	getCurrentSeriesMidlineSlideNum : function(){
		return Math.floor(Object.getLength(this.slides)/2)
	},
	
	getLastVisbleSeriesIndex : function(studyElementId){
		var lastVisibleSeriesIndex = Object.getLength(studies[studyElementId].series) - this.MAX_VISIBLE_PREVIEW_SERIES;
		lastVisibleSeriesIndex = lastVisibleSeriesIndex < 0 ? 0 : lastVisibleSeriesIndex;
		return lastVisibleSeriesIndex;
	},
	
	scrollVisibleSeriesPreviewCells : function(studyElementId, value){
		var newFirstVisibleIndex = this.seriesPreviewVisibleIndices[studyElementId];
		newFirstVisibleIndex += value;
		
		// Display up to MAX_VISIBLE_PREVIEW_SERIES at a time
		var lastSeriesIndex = this.getLastVisbleSeriesIndex(studyElementId);
		newFirstVisibleIndex = newFirstVisibleIndex > lastSeriesIndex ? lastSeriesIndex : newFirstVisibleIndex;
		// handles going back from the first series, or if there are fewer than MAX_VISIBLE_PREVIEW_SERIES to display
		newFirstVisibleIndex = newFirstVisibleIndex < 0 ? 0 : newFirstVisibleIndex;
		
		this.setFirstVisibleSeriesPreviewCell(studyElementId, newFirstVisibleIndex);
	},
	
	setFirstVisibleSeriesPreviewCell : function(targetStudyElementId, firstVisibleSeriesIndex){
		this.seriesPreviewVisibleIndices[targetStudyElementId] = firstVisibleSeriesIndex;
		$$('.seriesPreviewCell').each(function(seriesPreviewCell){
			var studyElementId = seriesPreviewCell.id.split("_")[0]
			var seriesElementId = seriesPreviewCell.id.split("_")[1]
			if(studyElementId == targetStudyElementId)
			{
				seriesIndex = seriesElementId.split("series")[1]
				seriesPreviewCell.addClass('seriesPreviewCellHidden');
				// Display up to MAX_VISIBLE_PREVIEW_SERIES at a time
				if(seriesIndex >= firstVisibleSeriesIndex && seriesIndex < (firstVisibleSeriesIndex + this.MAX_VISIBLE_PREVIEW_SERIES))
				{
					seriesPreviewCell.removeClass('seriesPreviewCellHidden');
				}
			}
		}.bind(this));
	},
		
	selectCurrentSeriesPreviewCell : function(){
		$$('.seriesPreviewCell').each(function(seriesPreviewCell){
			var studyElementId = seriesPreviewCell.id.split("_")[0]
			var seriesElementId = seriesPreviewCell.id.split("_")[1]
			seriesPreviewCell.removeClass('seriesPreviewCellSelected');
			if(studyElementId == this.currentStudyElementId && seriesElementId == this.currentSeriesElementId)
			{
				seriesPreviewCell.addClass('seriesPreviewCellSelected');
			}
		}.bind(this));
	},
		
	// last function, has no comma after the definition, keep as the last one for IE compatibility
	lastFunction : function(){ /* noop */ }
})

