/*
 * Transformer - pagination.js 
 * Version 1.0
 * Author: Fabio Vitali, 2023
 * All rights reserved. This software is NOT open source at the moment. Permission to use and modify this 
   file is granted to individuals requesting it explicitly to the author. This may change in the future.   
 */

var lastPagination = new Date(0,0,0);
var paginating = false;
var debug = false

let editor = null;
let functions = null;
let totalPageCount = 0
let currentPageCount = 0

var pageBottomTpl = `
	<div class="remaining"></div>
	<div class="footNoteArea"></div>
	<div class="bottomPreviousPage">
		<div class="left" data-content="$bottomLeft"></div>
		<div class="center" data-content="$bottomCenter"></div>
		<div class="right" data-content="$bottomRight"></div>
	</div>
	<div class="actualBreak"></div>
	<div class="topNextPage">
		<div class="left" data-content="$topLeft"></div>
		<div class="center" data-content="$topCenter"></div>
		<div class="right" data-content="$topRight"></div>
	</div>`

/* removed from Simplex
export default function paginate(options) {
	editor = options.editor
	functions = options.functions
	clearGeneratedContent()
	setTimeout(splitIntoPages,0)
}
*/

/* added from Simplex */
	editor = {
		dom: {
			select: (i) => document.querySelectorAll(i),
			getRoot: () => document.body
		}
	}
	functions = {
		isLineBreak: isLineBreak,
		isPageBreak: isPageBreak,
		noRemaining: noRemaining,
		isFootnote: isFootnote,
		numberingStyle: numberingStyle,
		ignore: ignore,
		findBestPlaceForTheBreak: findBestPlaceForTheBreak,
		getFootnotes: getFootnotes,
		generateHeadersAndFooters: generateHeadersAndFooters
	}
/* end added */

 let pagebreaks = []

 function splitIntoPages(where) {
 	let heightWith = (pos) => pos -1 - lastTop  + footnoteHeight
	paginating = true;
	const base = where || document.querySelector('#content')
	const baseTop = coords(base).top // base.offsetTop
	const baseLeft = coords(base).left // base.offsetLeft
	const documentClasses = base.classList.value

	const marginTop = mmToPx(
			getComputedValue('--document-margin-top')+
			getComputedValue('--distance-from-text')
		);
	const marginBottom = mmToPx(getComputedValue('--document-margin-bottom'));
	const marginLeft = mmToPx(getComputedValue('--document-margin-left'));
	const documentHeight = mmToPx(getComputedValue('--document-height'));
	const documentWidth = mmToPx(getComputedValue('--document-width'));

	const contentHeight = documentHeight - marginTop - marginBottom;

	hideFootnotes(base) 

	pagebreaks = []
	let blocks = getBlockNodes(base)
	let footnoteHeight = 0; 
	let currentStyle = ""; 
	let previousStyle = ""
	let classes = ""

	totalPageCount = 1 ;
	currentPageCount = 1 ;

	
	let breakAfter = -1
	let lastTop = 0; 

	base.dataset.contentHeight = contentHeight
	for (var j = 0; j< blocks.length; j++) {
		let node = blocks[j]
		let pos = coords(node)
	
		if (!node.id) node.id = generateFakeId()
		node.dataset.pretop = pos.top
		node.dataset.prebottom = pos.bottom
		
		let ba = breakAfter==-1 ? node : blocks[breakAfter] 
		let leftIndent = coords(ba)?.left - baseLeft ;
		let baBottom = coords(ba)?.top + coords(ba)?.height
		footnoteHeight += getFootnoteHeight(node)

		if (isPageBreak(node)) {        // The block is a forced page break
			classes = node.classList.value || ""
			previousStyle = currentStyle
			currentStyle = node.dataset.style || currentStyle


			if (node.dataset.start) 
				localPageCount = parseInt(node.dataset.start)
			if (!ignore(node)) {
				let leftIndent = pos.left - baseLeft ;
				let remaining = noRemaining(node) ? 0 : contentHeight - heightWith(pos.top) + footnoteHeight
				node.classList.add("existingBreak")
				node.dataset.remaining = remaining
				node.dataset.left = leftIndent
				node.dataset.previous = previousStyle
				node.dataset.footnote = footnoteHeight				
				footnoteHeight = 0
				lastTop = pos.top + 1
				breakAfter = j
			}

		} else {                        // This is a normal block

			let nodeBottom = pos.top + pos.height
			let KWN = keepWithNext(node)
			let KT = keepTogether(node)			

			if (heightWith(nodeBottom) <= contentHeight) {    // the block fits

				if (!KWN) {               // This block can be the last on page

					breakAfter = j

				}
			} else {                     // The block does not fit. We must break page. 

				if (blocks[j+1].matches('.eop')) {

				} else {
					let lb = getLineBreaks(node)
					let orphan = lb.length > 0 && heightWith(lb[0].bottom) <= contentHeight 

					if (KT || lb.length < 3 || orphan) {  
						// Keep Together or fewer than 3 lines or orphan 
						// use the existing breakAfter position

						let remaining = contentHeight - heightWith(baBottom) 
						let eop = document.createElement("span")
						eop.id = generateFakeId()
						eop.classList.add("eop", "generated")
						eop.classList.add(orphan?'orphan': KT ? "KeepTogether" : "short")
						eop.dataset.remaining = remaining
						eop.dataset.left = leftIndent
						eop.dataset.previous = previousStyle
						eop.dataset.footnote = footnoteHeight				
						ba.after(eop)
						lastTop = coords(eop).top
						footnoteHeight = getFootnoteHeight(node)

					} else {                 // Let's try to break it by line

						let i = 0
						let lineFootnoteHeight = getFootnoteHeight(lb[0])
						let bottom = coords(lb[i]).bottom
						
						while (heightWith(bottom) <= contentHeight) {
							i++
							bottom = coords(lb[i]).bottom
							lineFootnoteHeight += getFootnoteHeight(lb[i])
						}
						if (i == lb.length - 1) i--

						footnoteHeight += lineFootnoteHeight
						let theseCoords = coords(lb[i])
						leftIndent = theseCoords.left - baseLeft
						let remaining = contentHeight - heightWith(theseCoords.bottom)
						let eop = document.createElement("span")
						eop.id = generateFakeId()
						eop.classList.add("eop", "generated")
						eop.classList.add("brokeAt"+(i+2))
						eop.dataset.remaining = remaining
						eop.dataset.left = leftIndent
						eop.dataset.previous = previousStyle
						eop.dataset.footnote = footnoteHeight				
						lb[i+1].insertNode(eop)
						lastTop = coords(eop).top
						footnoteHeight = getFootnoteHeight(node) - lineFootnoteHeight
						breakAfter = j

					}
				}
			}
		}
	}
	
	insertPageBreaks(base)
	for (var j = 0; j< blocks.length; j++) {
		let node = blocks[j]
		let pos = coords(node)
	
		node.dataset.posttop = pos.top
		node.dataset.postbottom = pos.bottom
	}

	moveFootnotes(contentHeight,base)
	paginating = false
	return pagebreaks
}

function insertPageBreaks(base) {
	let eopList = document.querySelectorAll(eopSelector)
	for (var i=0;  i< eopList.length; i++) {
		let eop = eopList[i]
		let classes = Array.from(eop.classList).filter(i => !['eop', 'generated'].includes(i) )
		if (!ignore(eop)) {
			let pagebreak = document.createElement('span')
			pagebreak.classList.add('generated','pagebreak', ...classes)
			if (debug)  pagebreak.classList.add('minimized')
			pagebreak.id = "page-"+totalPageCount
//			debugger
			pagebreak.setAttribute('style',`
				--footnoteHeight: ${eop.dataset.footnote}px;
				--remainingHeight: ${eop.dataset.remaining}px;
				--leftIndent: ${eop.dataset.left}px;
			`)
			var data = generateHeadersAndFooters(pagebreak, localPageCount,eop.dataset.style, eop.dataset.previous)
			pagebreak.innerHTML = getHeadersAndFooters(data)
			pagebreak.dataset['pagenumber'] = data.shownPageNumber

			let actualLocation = findBestPlaceForTheBreak(eop)
			actualLocation.after(pagebreak)
			localPageCount++;
			totalPageCount++;
			pagebreaks.push(pagebreak)
		}
	}
	return pagebreaks
}

/*

 function NOsplitIntoPages() {
 	let heightWith = (pos) => pos +1 - lastTop + footnoteHeight
 	let blockHeight = () => currentMargin + (height||0) + additionalHeight ;
	paginating = true;
	const base = editor.dom.select('#content')[0]
	base.parentElement.scrollTo(0,0)
	const baseTop = 0 // base.offsetTop
	const baseLeft = 0 // base.offsetLeft
	const documentClasses = base.classList.value

	totalPageCount = 1 ;
	currentPageCount = 1 ;
	let currentStyle = ""; 
	let previousStyle = ""
	let classes = ""

	const marginTop = mmToPx(getComputedValue('--document-margin-top'));
	const marginBottom = mmToPx(getComputedValue('--document-margin-bottom'));
	const marginLeft = mmToPx(getComputedValue('--document-margin-left'));
	const documentHeight = mmToPx(getComputedValue('--document-height'));
	const documentWidth = mmToPx(getComputedValue('--document-width'));

	const contentHeight = documentHeight - marginTop - marginBottom;

	hideFootnotes(base) 
	let blocks = getBlockNodes(base)
	let breakAfter = -1
	let lastTop = 0; 
	let footnoteHeight = 0; 

	for (var j = 0; j< blocks.length; j++) {
		let node = blocks[j]
		let ba = breakAfter==-1 ? null : blocks[breakAfter] 
		let leftIndent = breakAfter == -1 ? 0 : 
				(ba?.startContainer?.nodeType==Node.ELEMENT_NODE ?
				ba?.startContainer?.offsetLeft :
				ba?.offsetLeft) - baseLeft ;
		let baBottom = breakAfter == -1 ? 0 : 
				ba?.offsetTop + ba?.offsetHeight

		if (isPageBreak(node)) {        // The block is a forced page break
			classes = node.classList.value || ""
			previousStyle = currentStyle
			currentStyle = node.dataset.style || currentStyle

			if (node.dataset.start) 
				localPageCount = parseInt(node.dataset.start)
			if (!ignore(node)) {
				let remaining = noRemaining(node) ? 0 : contentHeight - heightWith(baBottom)
				let pb = addPageBreak(blocks,breakAfter, remaining, leftIndent, classes, currentStyle, previousStyle)
				lastTop = pb.offsetTop + pb.offsetHeight
				footnoteHeight = 0
				breakAfter = j+1
			}

		} else {                        // This is a normal block

			let nodeBottom = node.offsetTop + node.offsetHeight
			let KWN = keepWithNext(node)
			let KT = keepTogether(node)			

			if (heightWith(nodeBottom) <= contentHeight) {    // the block fits
				footnoteHeight += getFootnoteHeight(node)

				if (!KWN) {               // This block can be the last on page

					breakAfter = j+1

				}
			} else {                     // The block is larger than the page. 				


				if (KT) {                // The block should not be broken by lines
					let remaining = contentHeight - heightWith(baBottom) 
 					let pb = addPageBreak(blocks,breakAfter, remaining, leftIndent, classes, currentStyle, previousStyle)
					lastTop = pb.offsetTop + pb.offsetHeight
					footnoteHeight = getFootnoteHeight(node)
					breakAfter = j

				} else {                 // Let's try to break it by line

					let lb = getLineBreaks(node) 
					if (lb.length < 3) {   // A widow or orphan is inevitable

						let remaining = contentHeight -  heightWith(baBottom) 
						let pb = addPageBreak(blocks,breakAfter, remaining, leftIndent, classes, currentStyle, previousStyle)
						lastTop = pb.offsetTop + pb.offsetHeight
						footnoteHeight = getFootnoteHeight(node)
						breakAfter = j

					} else {
						let i = 0
						let lineFootnoteHeight = getFootnoteHeight(lb[i])
						
						while (heightWith(lb[i].bottom) <= contentHeight) {
							i++
							lineFootnoteHeight += getFootnoteHeight(lb[i])
						}
						if (i==1) {			// Orphan. 
							let remaining = contentHeight - heightWith(baBottom)
 							let pb = addPageBreak(blocks,breakAfter, remaining, leftIndent, classes, currentStyle, previousStyle)
							lastTop = pb.offsetTop + pb.offsetHeight
							footnoteHeight = lineFootnoteHeight
							breakAfter = j
						} else {
							if (i == lb.length - 2) {		// Widow
								i--
							}
							footnoteHeight += lineFootnoteHeight
							let remaining = contentHeight - heightWith(lb[i].bottom)
 							let pb = addPageBreak(lb, i, remaining, leftIndent, classes, currentStyle, previousStyle)
							lastTop = pb.offsetTop + pb.offsetHeight
							breakAfter = j+1
							footnoteHeight = getFootnoteHeight(node) - lineFootnoteHeight
						}
					}
				}
			}
		}
	}
	
	moveFootnotes(contentHeight,base)
	paginating = false
	return pagebreaks
}


 function OLDsplitIntoPages() {
 	let pagebreaks = []
	paginating = true;
	const base = editor.dom.select('#content')[0]
	base.parentElement.scrollTo(0,0)
	const baseTop = base.getBoundingClientRect().top
	const baseLeft = base.getBoundingClientRect().left
	const documentClasses = base.classList.value

	const marginTop = mmToPx(getComputedValue('--document-margin-top'));
	const marginBottom = mmToPx(getComputedValue('--document-margin-bottom'));
	const marginLeft = mmToPx(getComputedValue('--document-margin-left'));
	const documentHeight = mmToPx(getComputedValue('--document-height'));
	const documentWidth = mmToPx(getComputedValue('--document-width'));

	const contentHeight = documentHeight - marginTop - marginBottom;

	hideFootnotes(base) 
	
	const linebreaks = getLineBreaks(base)
	const lb = linebreaks.map( i => {
		let a = i.getBoundingClientRect()
		a.item = i
		a.additional = i.additionalHeight || 0
		a.isPageBreak = functions.isPageBreak(i)
		a.isFootnote = functions.isFootnote(i)
		a.noRemaining = functions.noRemaining(i)
		a.numberingStyle = functions.numberingStyle(i)
		a.ignore = functions.ignore(i)
		a.botton = a.isFootnote ? i.dataset.bottom: a.bottom 
		return a
	})

	totalPageCount = 1 ;
	currentPageCount = 1 ;
	let currentStyle = ""; 
	let previousStyle = ""
	let previousBottom = 0;
	let previousHeight = 0;
	let remaining = 0 ;
	let leftIndent = - baseLeft;
	let soFar = 0; 
	let additional = 0; 
	
	for (var i = 0; i < lb.length; i++) {
		let top = lb[i].top - baseTop
		let bottom = lb[i].bottom - baseTop
		additional += lb[i].additional 
		let c = lb[i].item.toString()
		if (lb[i].isPageBreak || bottom + additional > soFar + contentHeight ) {
			let loc = functions.findBestPlaceForTheBreak(lb[i],i, lb)
			let leftIndent = 
					(loc?.startContainer?.nodeType==Node.ELEMENT_NODE ?
					loc?.startContainer?.offsetLeft :
					loc.offsetLeft) - baseLeft ;
			let remaining = lb[i].noRemaining ? 0 : soFar + contentHeight - (bottom + additional) 
			let classes = lb[i].isPageBreak ? lb[i].item.classList.value : ""
			previousStyle = currentStyle
			currentStyle = lb[i].isPageBreak ? lb[i].item.dataset.style : currentStyle
			if (lb[i].item.dataset?.start) 
				localPageCount = parseInt(lb[i].item.dataset.start)
			if (!lb[i].ignore) {
				pb = addPageBreak(loc, remaining, leftIndent, localPageCount, classes, currentStyle, previousStyle)
				soFar = lb[i].isPageBreak ? bottom+1 : top
				additional = 0; 
				localPageCount++;
				totalPageCount++;
				pagebreaks.push(pb)
			}
		} else {
		}
	}
	moveFootnotes(contentHeight,base)
	paginating = false
	return pagebreaks
}

 function addPageBreak(list, location, remaining, leftIndent, additionalclass, style, previous) {
	let pagebreak = document.createElement('span')
	pagebreak.classList.add('generated','pagebreak')
	if (debug)
		pagebreak.classList.add('minimized')
	if (additionalclass) pagebreak.classList.add(...additionalclass.split(" "))
	pagebreak.setAttribute('style',`
		--footnoteHeight: 0px;
		--remainingHeight: ${remaining}px;
		--leftIndent: ${leftIndent}px;
	`)
	pagebreak.id = "page-"+totalPageCount
	var data = functions.generateHeadersAndFooters(pagebreak, localPageCount,style, previous)
	pagebreak.innerHTML = getHeadersAndFooters(data)
	pagebreak.dataset['pagenumber'] = data.shownPageNumber
	if (location== -1) {  					// location is at start
		list[0].before(pagebreak)
	} else if (list[location].after) {		// location is a Node
		list[location].after(pagebreak)
	} else {								// location is a Range
		let lbitem = findBestPlaceForTheBreak(lbitem,i, lb)
		debugger
		list[location].insertNode(pagebreak)
	}
	localPageCount++;
	totalPageCount++;
	pagebreaks.push(pagebreak)
	return pagebreak
}
*/

function getHeadersAndFooters(data) {
	var content = pageBottomTpl
		.replace("$bottomLeft",   data?.bottomLeft   || "")
		.replace("$bottomCenter", data?.bottomCenter || "")
		.replace("$bottomRight",  data?.bottomRight  || "")
		.replace("$topLeft",      data?.topLeft      || "")
		.replace("$topCenter",    data?.topCenter    || "")
		.replace("$topRight",     data?.topRight     || "")
	return content
}

function clearGeneratedContent() {
	const generatedPageBreaks = editor.dom.select('.generated')
	for (let j of generatedPageBreaks) j.remove()
	const ghostedElement = editor.dom.select('.ghosted')
	for (let j of ghostedElement) {
		j.classList.remove('ghosted')
		j.removeAttribute('ghostedBy')
	}
}


	// https://stackoverflow.com/questions/55604798/find-rendered-line-breaks-with-javascript
function getLineBreaks(n) {
	if( !n || !n.parentNode) return []
	let tn = n.nodeType == Node.TEXT_NODE ? [n] : allTextNodes(n, true, footnoteSelector)
	const lines = [];

	const range = document.createRange();
	range.setStart(tn[0], 0);
	range.setEnd(tn[0], 0);
	range.additionalHeight = 0; 
	
//	lines.push( range.cloneRange() )
	let prevBottom = range.getBoundingClientRect().bottom;
	let lastFound = 0;
	let node

	for (var i=0; i<tn.length; i++) {
		node = tn[i] ;
		if (node.nodeType == Node.ELEMENT_NODE) {
			if (functions.isLineBreak(node)) lines.push( node )
			if (functions.isFootnote(node)) {
				range.additionalHeight += parseFloat(node.dataset.height)
			}
		} else {
			range.setStart(node, 0);
			let str = node.textContent;
			let current = 1; // we already got index 0
			let bottom = 0;
			let oldCurrent = 0

			while(current <= str.length) {
				range.setStart(node, current);
				range.setEnd(node, current);
				if(current < str.length -1) range.setEnd(node, current+1);
				bottom = range.getBoundingClientRect().bottom;
				if(bottom > prevBottom) {
					// line break
					let oldRange = range.cloneRange()
					
					oldRange.setStart(node, oldCurrent)
					oldRange.setEnd(node, oldCurrent+Math.min(10,oldRange.commonAncestorContainer.length-oldCurrent))
					oldRange.additionalHeight = range.additionalHeight
					range.additionalHeight = 0; 					
					lines.push( oldRange );
					prevBottom = bottom;
					lastFound = current;
				}
				oldCurrent = current
				current++;
			}
		}
	}
	return lines;
}



function createShadowContainer(container) {
		let shadows = document.createElement('div')
		shadows.classList.add('generated','pageShadows')
		container.prepend(shadows)
		return shadows
}

function addShadow(shadows, pb, offset) {
	let br = pb.querySelector('.actualBreak')
	let start = coords(br).top + coords(br).height
	if (start!==0) start -= offset 
		let s = document.createElement('div')
		s.classList.add('generated','pageShadowVertical')
		s.setAttribute('style',`--start: ${start}px;`)
		s.innerHTML=` `
		shadows.append(s)
		s = document.createElement('div')
		s.classList.add('generated','pageShadowHorizontal')
		s.setAttribute('style',`--start: ${start}px;`)
		s.innerHTML=` `
		shadows.append(s)
}



