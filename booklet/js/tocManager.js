/*
 * Transformer - tocManager.js 
 * Version 1.0 
 * Author: Fabio Vitali, 2023
 * All rights reserved. This software is NOT open source at the moment. Permission to use and modify this 
   file is granted to individuals requesting it explicitly to the author. This may change in the future.   
 */

		function createTOC() {
			let fake = document.createElement('div')

			let toc = []
			const here = document.querySelector('.tableofcontent')

			if (here) {	
				here.innerHTML = ""
				const base = document.querySelector('#content')
				const basetoc = getTocItems(base)
				for (var i=0; i<basetoc.length; i++) {
					let content
					let item = basetoc[i]
					item.id = item.id || generateFakeId() 
					let relevantClasses = Array.from(item.classList).filter( i => i.match(/^toc/) )

					if (item.dataset['toclevel']) {
						tocitem.classList.add('toclevel-' + item.dataset['toclevel'])
					}

					if (relevantClasses.includes('tocsplit')) {
						let dn = item.querySelector('.docNumber')
						let dt = item.querySelector('.docTitle')
						content = `
							<span class="docNumber">${dn.innerText}</span>
							<span class="label">${dt.innerText}</span>
							<span class="pagenumber"></span>`					
					} else {
						content = `
							<span class="label">${item.innerText}</span>
							<span class="pagenumber"></span>`
					}

					let tocitem = `
						<div id="tocitem-${item.id}" class="tocitem ${relevantClasses.join(" ")}"  data-dest="${item.id}">
							${content}
						</div>
					`
					
					fake.innerHTML = tocitem
					toc.push({source: basetoc[i], toc: fake.children[0], location:here})
					here.append(fake.children[0])
				}
				return toc
			}
		}
		
		function addPageNumbersToTOC(toc, pagebreaks) {
			if (toc && pagebreaks) {	
				for (var i=0; i<toc.length; i++) {
					for (var j=0; j<pagebreaks.length-1; j++) {
						if (between(toc[i].source, pagebreaks[j], pagebreaks[j+1])) {
							toc[i].toc.querySelector('.pagenumber').innerHTML 
								= pagebreaks[j+1].dataset['pagenumber']						
						}
					}
				}
			}
		}

function createInteractiveTOC(toc, where) {
	if (toc) {
		let interactiveTOC = toc[0].location.cloneNode(true)
		let loc = document.querySelector(where)
		if (loc) {
			loc.innerHTML = ""
			loc.appendChild(interactiveTOC)	
			var elems = document.querySelectorAll('#interactiveToc .tocitem');

			elems.forEach( i => {
			    i.addEventListener('click', function(evt) {
			    	scrollTo(this.dataset.dest);
					let dest = document.getElementById(this.dataset.dest)
					dest.classList.toggle("animate")
					setTimeout(i => {dest.classList.toggle("animate")}, 3000)
    			}, true); // <-- the `true` allows this event to happen in the capture phase.
  			});				
		}
	}
}

var TLCLabel = {
	TLCEvent: "Events",
	TLCOrganization: "Organizations",
	TLCPerson: "People",
	TLCTerm: "Terms",
}
function createInteractiveEntities(where) {
	references = document.querySelectorAll('[name="references"]')
	var refs = {}
	references.forEach( a => {
		Array.from(a.children).forEach( i => {
			let name = i.attributes['name'].value
			let href = i.dataset['href']
			let label =  i.dataset['showas']
			if (!refs[name]) refs[name] = {}
		    refs[name][href] = label
		})
	}); 
	
	let loc = document.querySelector(where)
	if (loc) {
		loc.innerHTML = ""
		for (var i in refs) {
//			refs[i].sort( (a,b) => {return a.toUppercase() < b.toUpperCase() })
			let entity = []
			for (var j in refs[i]) {
				let mentions = ""
				let m = document.querySelectorAll(`[data-refersTo="${j}"]`)	
				if (m.length>0)	{		
					for (var l=0; l<m.length; l++) {
						m[l].id = m[l].id || generateFakeId() 
						let texts = surroundingContent(m[l])

						mentions+= `
							<div class="entitylabel" data-dest="${m[l].id}">
								${texts.before} <span class="inner">${texts.inner}</span> ${texts.after} 
							</div>					
						`
					}
					entityId = generateFakeId()
					entity.push({
						l: m.length,
						text: `
						<div class="entityitem">
							<div class="label" data-dest="${entityId}">
								<span class="labelText">${refs[i][j]}</span>
								<span class="labelLength">${m.length}</span>
							</div>
							<div class="mentions hidden" id="${entityId}">
								${mentions}
							</div>
						</div>`
						})
					}
			}		
			entity.sort((a,b) => {return (a.l >= b.l ? -1 : 1)})
			let e = entity.map( i => i.text)
			if (entity.length >0) {
				loc.innerHTML += `
					<div class="entityheader" data-dest="list-${entityId}">${TLCLabel[i]}</div>
					<div class="entityList" id="list-${entityId}">
						${e.join("")}
					</div>`
			}
		}

		var elems = document.querySelectorAll('#interactiveEntities .entitylabel');

		elems.forEach( i => {
			i.addEventListener('click', function(evt) {
				scrollTo(this.dataset.dest);
				let dest = document.getElementById(this.dataset.dest)
				dest.classList.toggle("animate")
				setTimeout(i => {dest.classList.toggle("animate")}, 3000)
			}, true); // <-- the `true` allows this event to happen in the capture phase.
		});				
		var mentions = document.querySelectorAll('#interactiveEntities .entityitem .label, #interactiveEntities .entityheader');

		mentions.forEach( i => {
			i.addEventListener('click', function(evt) {
				let id = this.dataset.dest
				let mList = document.querySelector('#'+id)
				mList.classList.toggle('hidden');
			}, true); // <-- the `true` allows this event to happen in the capture phase.
		});				
	}
}

let wordsAround = 2
function surroundingContent(node) {
	var blockElements = ['P', 'DIV', 'FIGCAPTION', 'LI', 'TR', 'DD', 'BODY']
	var thisAtn = allTextNodes(node)
	var container = node.parentElement 
	while (blockElements.indexOf(container.nodeName) == -1) container = container.parentElement
	var atn = allTextNodes(container)
	
	var texts = {
		before: "",
		inner: node.innerText,
		after: ""
	}
	
	if (thisAtn[0].position !== 0) {
		var i = thisAtn[0].position - 1
		var words = []
		while (i> -1 && words.length <= wordsAround+10) {
			words = [...(atn[i--].textContent.split(/\s+/)), ...words]
		}
		var end = words.length-1
		var start = words.length-1
		var totalWords = 0
		while (totalWords < wordsAround && 0 <= start)
			if (words[start--].match(/\w+/)) 
				totalWords++
		texts.before = words.slice(start+2, end+1).join(" ")
	}
	if (thisAtn[thisAtn.length-1].position !== atn.length-1) {
		i = thisAtn[thisAtn.length-1].position + 1
		words = []
		while (i< atn.length && words.length <= wordsAround+10) {
			words = [...words, ...(atn[i++].textContent.split(/\s+/))]
		}
		var end = 0
		var start = 0
		var totalWords = 0
		while (totalWords <= wordsAround && end < words.length)
			if (words[end++].match(/\w+/)) 
				totalWords++
		texts.after = words.slice(start, end-1).join(" ")
	}
	return texts
}



