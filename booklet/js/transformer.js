/*
 * Transformer - transformer.js 
 * Version 1.0
 * Author: Fabio Vitali, 2023
 * All rights reserved. This software is NOT open source at the moment. Permission to use and modify this 
   file is granted to individuals requesting it explicitly to the author. This may change in the future.   
 */


const xsltProcessor = new XSLTProcessor();
const xslurl = "./util/AknToHTML.xsl"
let transformer = null


let pagebreak = document.createElement('span')
pagebreak.classList.add('eop')



// load and show a document
async function loadData(file) {
	let d = await getContent(file, -1)
	let fragment, dontRestart = false
	for (var f in d.docs) {
		if (d.docs[f].url) {
			fragment =  await getContent(d.docs[f].url, f)
		} else if (d.docs[f].tpl) {
			let tpl = await getContent(d.docs[f].tpl, f)
			let x = await generateContent(tpl.innerHTML, d.docs[f], d.meta)
			tpl.innerHTML = x
			fragment = tpl
		}
		if (fragment) {
			fragment.dataset['url'] = d.docs[f].tpl || d.docs[f].url
			let pbAdditional = pagebreak.cloneNode()
			let pbBefore = pagebreak.cloneNode()
			let pbAfter = pagebreak.cloneNode()
			
			if (d.docs[f].start) {
				pbBefore.dataset['start'] = d.docs[f].start
				pbAfter.dataset['start'] = d.docs[f].start
			}
			if (d.docs[f].style) {
				pbAdditional.dataset['style'] = d.docs[f].style
				pbBefore.dataset['style'] = d.docs[f].style
				pbAfter.dataset['style'] = d.docs[f].style
			}
			if (d.docs[f].style?.includes("fullpage")) {
				pbBefore.classList.add("before")
				if (f==0) 
					pbBefore.classList.add("initial")
				fragment.prepend(pbBefore)

				pbAfter.classList.add("after", "noRemaining")
				dontRestart = true
				if (f==d.docs.length-1) 
					pbAfter.classList.add("final")
				fragment.append(pbAfter)
			} else if (d.docs[f].style?.includes("newpage")) {
				pbBefore.classList.add("before")
				if (f==0) 
					pbBefore.classList.add("initial")
				if (dontRestart) {
					pbBefore.classList.add("ignore")
				}
				fragment.prepend(pbBefore)
				dontRestart = false
			} else if (f==0) {
				pbBefore.classList.add("before", "initial")
				fragment.prepend(pbBefore)				
			} else if (f == d.docs.length-1) {
				pbAfter.classList.add("after", "final")
				fragment.append(pbAfter)				
			}
			if (d.docs[f].style?.includes("oddpage")) {
				pbAdditional.classList.add("ifEven")
				fragment.prepend(pbAdditional)
			}
			if (d.docs[f].style?.includes("evenpage")) {
				pbAdditional.classList.add("ifOdd")
				fragment.prepend(pbAdditional)
			}
			d.docs[f].data = fragment
		}
		
	}
	data = d
	showData(data)
}

async function getContent(url, i) {
	let data
	let response = await fetch(url)
	let type = response.headers.get("content-type")
	if (type.indexOf("json") !== -1) {
		data = await response.json()
	} else if (type.indexOf("xml") !== -1) {
		let str = await response.text()
		let xml = new DOMParser().parseFromString(str, "text/xml")
		if (!transformer) {
			const xsl1 = await fetch(xslurl)
			const xsl2 = await xsl1.text()
			transformer = new DOMParser().parseFromString(xsl2, "text/xml")
			xsltProcessor.importStylesheet(transformer)
		}
		xsltProcessor.setParameter("", "docPrefix", "doc"+i+'-')
		var doc = xsltProcessor.transformToDocument(xml);
		var content = doc.querySelector('.canvas')
		data = document.importNode(content, true)
	} else if (type.indexOf("html") !== -1) {
		var str = await response.text()
		var doc = new DOMParser().parseFromString(str, "text/html")
		var content = doc.querySelector('.canvas')
		data = document.importNode(content, true)
	} else if (type.indexOf("pdf") !== -1) {
		var blob = await response.blob()
		data = URL.createObjectURL(blob)
	} else {
		data = await response.text()
	}
	return data
}

async function generateContent(tpl, content, meta) {
	var data = {meta:meta, content:content}
	var template = Handlebars.compile(tpl);
	return template(data);
}

function showData(data) {
	let destination = document.querySelector('#content')
	destination.innerHTML = ""
	for (var f in data.docs) {
		if (data.docs[f].data)
			destination.append(...data.docs[f].data.childNodes)
	}
	resetFakeId()
	clearGeneratedContent()
	let toc = createTOC()
	let fn = numberFootnotesAndMoveThem()

	let pb = splitIntoPages()

	addPageNumbersToTOC(toc, pb)
	createInteractiveTOC(toc, '#interactiveToc')
	createInteractiveEntities('#interactiveEntities')
	
	
	if (destination.classList.contains("showPageShadows")) {
//		const offset = destination.getBoundingClientRect().top
		const offset = coords(destination).top
		let shadows = createShadowContainer(destination)
		for (var i=0; i< pb.length-1; i++) {
			addShadow(shadows, pb[i], offset)			
		}
	}
//	destination.classList.remove('paged')
//	destination.classList.add('scroll')
}		


