/*
 * Transformer - akn-functions.js 
 * Version 1.0
 * Author: Fabio Vitali, 2023
 * All rights reserved. This software is NOT open source at the moment. Permission to use and modify this 
   file is granted to individuals requesting it explicitly to the author. This may change in the future.   
 */


const blockSelector = ".eop, p, h1, h2, ul, ol, dt, dd, tr, [pattern='block'], [pattern='num'], [pattern='heading'], div:not([pattern])"
const footnoteSelector = "*[name='authorialNote'], *[name='note'], .footnote"
const tocitemSelector = ".toc, .statement .preface .p"
const eopSelector = ".eop"
const brSelector = ".eop, br, hr"
const noRemainingSelector = ".noRemaining, .initial"
const entitiesSelectors = [
	{label: "Persons", selector :".person"},
	{label: "Organizations", selector :".organization"},
	{label: "Events", selector :".event"},
	{label: "Terms", selector :".term"},
]


function getFootnoteHeight(r) {
	if (r.nodeType == Node.ELEMENT_NODE) {
		let fn = r.querySelectorAll(footnoteSelector)
		let height = 0
		for (var i=0; i<fn.length; i++) {
			height += parseFloat(fn[i].dataset.height)
		}
		return height
	} else {
		return r.additionalHeight
	}
}
function isLineBreak(r) {
	if (r.nodeType == Node.ELEMENT_NODE) {
		return r.matches(brSelector)
	}
	return false
}

function isPageBreak(r) {
	if (r.nodeType == Node.ELEMENT_NODE) {
		return r.matches(eopSelector)
	}
	return false
}

function isFootnote(r) {
	if (r.nodeType == Node.ELEMENT_NODE) {
		return r.matches(footnoteSelector)
	}
	return false
}

function noRemaining(r) {
	if (r.nodeType == Node.ELEMENT_NODE) {
		return r.matches(noRemainingSelector)
	}
	return false
}

function keepWithNext(node) {
	return false
}


function keepTogether(node) {
	return false
}

function numberingStyle(r) {
	if (r.nodeType == Node.ELEMENT_NODE) {
		if (r.classList.contains('roman')) {
			return 'roman' 
		} else if (r.classList.contains('ROMAN')) {
			return 'ROMAN' 
		}
	}
	return "arabic"
}

function ignore(r) {
	if (r.nodeType == Node.ELEMENT_NODE) {
		if (r.classList.contains('ignore')) 
			return true 
		if (r.classList.contains('ifOdd') && totalPageCount % 2 == 0) 
			return true 
		if (r.classList.contains('ifEven') && totalPageCount % 2 == 1) 
			return true 
	}
	return false
}
function getBlockNodes(base) {
	if (base) {
		const blocks = base.querySelectorAll(blockSelector)
		const realBlocks = Array.from(blocks).filter(i => i.closest(footnoteSelector) == null)
		return realBlocks	
	}
}

let fakeIdCount = 0
function generateFakeId() {
	return "id-"+fakeIdCount++
}
function resetFakeId() {
	fakeIdCount = 0	
}


function getTocItems(base) {
	if (base) {
		const basetoc = base.querySelectorAll(tocitemSelector)
/*		basetoc.forEach( i => { 
			if (i.classList.contains('toc')) {
				i.dataset['toclabel2'] = i.innerText
			} else {
				i.classList.add("tocsplit") 
				i.dataset['toclabel1'] = i.querySelector('.docNumber').innerText
				i.dataset['toclabel2'] = i.querySelector('.docTitle').innerText
			}
		})
*/		return basetoc	
	}
}

function findBestPlaceForTheBreak(node) {
	if (node == null) return lb.item
	if (node.closest("[pattern='num'] [pattern='header']") !== null) {
		debugger
		let r = document.createRange()
		r.selectNode(node.closest(
					 `  *[pattern="listItem"],
						*[pattern="block"],
						*[pattern="hcontainer"]  `))
		return r
	}
	if (node.closest("[name='authorialNote'], .footnote") !== null) {
		debugger
		let i = pos-1
		let newNode
		do {
			newNode = lbs[i].item.commonAncestorContainer.parentElement
			i--
		} while (i>=0 && newNode && newNode.closest("[name='authorialNote']") !== null)
		return lbs[i+1].item
	}
	if (node.closest("td") !== null) {
		debugger
		let tr = node.closest("tr")
		let table = tr.closest("table")
		let newTable = splitTableAt(tr, true)
		debugger		
		return newTable
	}
	if (node.closest(".label") !== null) {
		debugger
		let r = document.createRange()
		r.selectNode(node.closest(".tocitem"))
		return r
	}
	
	return node
}

function splitTableAt(row, repeatHeaders) {
	let tbody = row.closest("tbody")
	let table = row.closest("table")
	
	let newTable = table.cloneNode(true)
	let newTB = newTable.tBodies[0]
	newTB.innerHTML = ""

	let pos = getIndex(row)
	let node = tbody.children[0]
	while (node) {
		let newNode = node.nextElementSibling
		if (getIndex(node) < pos) {
			if (node.nodeName == "TH") {
				let newTH = node.cloneNode(true)
				newTB.append(newTH)
			}
		} else {
			newTB.append(node)		
		}
		node = newNode
	}
	table.parentElement.insertBefore(newTable, table.nextSibling)
	return newTable
}

// https://stackoverflow.com/questions/4649699/
function getIndex(node) {
	return Array.prototype.indexOf.call(node.parentNode.children, node);
}


function getFootnotes(base) {
	if (base) {
		const basefns = base.querySelectorAll(footnoteSelector)
		return basefns
	}
}

const pageNumberinBottomOfPage = true

function generateHeadersAndFooters(element, pageNumber, dataset, previous) {
	let container = element.closest("[pattern='container'], [pattern='hcontainer']")
	let label = dataset?.label || container?.id.split('__')[0].replace('_',' ') || ""
	let d = pageNumberinBottomOfPage ? previous : dataset 
	
	if (d?.includes("nopagenumber")) {	
		var num = ""
	} else if (d?.includes("roman")) {	
		var num = romanize(pageNumber,false) 
	} else {
		var num = pageNumber 
	}
	return {
		bottomCenter: num? `- ${num} -` : '',
		topRight: label,
		shownPageNumber: num
	}
}

function scrollTo(x) {
	let dest =  document.querySelector('#'+x)
	dest.scrollIntoViewIfNeeded()
}


function romanize (num,capitalized) {
	if (isNaN(num))
		return NaN;
	var digits = String(+num).split(""),
	key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
		   "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
		   "","I","II","III","IV","V","VI","VII","VIII","IX"],
	roman = "",
	i = 3;
	while (i--)
		roman = (key[+digits.pop() + (i * 10)] || "") + roman;
	roman = Array(+digits.join("") + 1).join("M") + roman;
	if (capitalized) {
		return roman
	} else {
		return roman.toLowerCase()
	}
	
}

function between(what, first, second) {
	if (first.compareDocumentPosition(what) & Node.DOCUMENT_POSITION_FOLLOWING) {
		if (second.compareDocumentPosition(what) & Node.DOCUMENT_POSITION_PRECEDING) {
			return true
		}
	} 
	return false
}

function rect(x1, y1, w, h, content, text, color) {
	let c = content || document.body
	let cTop = coords(c).top
	let svg = document.getElementById('svg')
	if (!svg) {
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    	svg.setAttribute('id', 'svg');
    	svg.setAttribute('width', 1000);
    	svg.setAttribute('height', 50000);
    	svg.setAttribute('style','position:absolute; top:0; left:400;')
		c.appendChild(svg)
    }
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g.innerHTML = `
		<title>${text} - rect is top: ${Math.round(y1)}, h: ${Math.round(h)}</title>
		<rect x="${x1+10}" y="${y1}" width="${w - 20}" height="${h}" 
		style="fill:transparent;stroke:${color || "#bbbbbb"}; stroke-width:1"
		/>
	`
	svg.appendChild(g)
}



  // Can be improved, see https://stackoverflow.com/questions/7650413/pixel-to-mm-equation
function mmToPx(mm) { return mm / 0.26458333333719 };
function pxToMm(px) { return px * 0.26458333333719 };

function getComputedValue(name) {
	const s = getComputedStyle(
		editor.dom.getRoot()
	).getPropertyValue(name);
	return parseInt( s.substring(0, s.length - 2), 10 );
}

function allTextNodes(node, includeEmptyNodes=false, wholeNodes, position) {
	if (!position) position = 0
	var tn = [];
	if (includeEmptyNodes && node.childNodes.length == 0) {
		return [node]
	}
	if (wholeNodes && node.matches(wholeNodes)) {
		return [node]
	}
	for (var i=0; i < node.childNodes.length;i++) {
		var n = node.childNodes[i] ;
		if (n.nodeType == Node.TEXT_NODE) {
			n.position = position++
			tn.push(n)
		} else {
			let content = allTextNodes(n, includeEmptyNodes, wholeNodes, position)
			tn = tn.concat( content )
			position += content.length
		}
	}
	return tn ;
}

// https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
function coords( el ) {
	if (el?.nodeType==Node.ELEMENT_NODE) {
		var _x = 0;
		var _y = 0;
		var _h = el.offsetHeight
		while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
			_x += el.offsetLeft - el.scrollLeft;
			_y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}
		return { top: _y, left: _x, height: _h, bottom: _y+_h };
	} else if (el.constructor.name == 'Range') {
//		debugger
		let c = el.getBoundingClientRect()
		let dad =  el.commonAncestorContainer.parentElement.closest(blockSelector)
		let offsets = dad.getBoundingClientRect()
		let dadsc = coords(dad)
		let _x = c.left - offsets.left + dadsc.left 
		let _y = c.top - offsets.top + dadsc.top
		let _h = c.height
		return { top: _y, left: _x, height: _h, bottom: _y+_h };
	
	}
}

function q(i,j) { 
	if (j) return Array.from(j.querySelectorAll(i)) ; 
	return Array.from(document.querySelectorAll(i)) 
}

function outerD(el, page) { 
	let ab = $('#page-'+page+' .actualBreak')[0]; 
	if (typeof el == "string")
		el = q(el)[0]
		
	return coords(el).bottom - coords(ab).top 
} 

function innerD(el, page) { 
	let ab = $('#page-'+page+' .actualBreak')[0]; 
	if (typeof el == "string")
		el = q(el)[0]
		
	return coords(el).top - coords(ab).bottom 
} 















