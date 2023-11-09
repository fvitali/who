/*
 * Transformer - footnoteManager.js 
 * Version 1.0
 * Author: Fabio Vitali, 2023
 * All rights reserved. This software is NOT open source at the moment. Permission to use and modify this 
   file is granted to individuals requesting it explicitly to the author. This may change in the future.   
 */


function numberFootnotesAndMoveThem() {
	let num = 1
	let fnlist = []
	const base = document.querySelector('#content')
	const fns = getFootnotes(base)
	for (var i=0; i<fns.length; i++) {
		let marker = document.createElement('span')
		marker.classList.add('FNmarker')

		if (fns[i].dataset['start']) {
			num = fns[i].dataset['start']
		}
		if (!fns[i].dataset['marker']) {
			fns[i].dataset['marker'] = num++
		} else if (fns[i].dataset['marker'] == 'same') {
			fns[i].dataset['marker'] = num-1				
		}
		marker.innerHTML = fns[i].dataset['marker']					
		fnlist.push({source: fns[i], marker: marker})
		fns[i].parentElement.insertBefore(marker, fns[i])
	}
	return fnlist
}




function hideFootnotes(base) {
	const footNotes = functions.getFootnotes(base)
	for (var i=0; i<footNotes.length; i++) {
		footNotes[i].dataset.height = coords(footNotes[i]).height
		footNotes[i].classList.add('ghosted')
	}
}

function moveFootnotes(contentHeight, base) {
	const footNotes = functions.getFootnotes(base)
	const fnAreas = editor.dom.select(".footNoteArea")
	var fn4pb = []
	let goOn = 0

	for (var i=0; i<footNotes.length; i++) {
		let j = 0
		do {
			goOn = footNotes[i].compareDocumentPosition(fnAreas[j]) & Node.DOCUMENT_POSITION_FOLLOWING
			j++
		} while (goOn==0 && j < fnAreas.length)
		if (fn4pb[j-1] == undefined) fn4pb[j-1] = []
		fn4pb[j-1].push(footNotes[i])
	}
	var ghosted =0
	for (var i=0; i<fn4pb.length; i++) {
		let fnHeight = 0; 
		for (var j in fn4pb[i]) {
			let fn = fn4pb[i][j]
			if (fn.innerHTML.trim() !=='') {
				let ghost = fn.cloneNode(true)

				ghost.classList.remove('ghosted')
				ghost.classList.add('ghosting')
				ghost.setAttribute("ghostId", "ghost-"+(++ghosted))
				fn.setAttribute("ghostedBy", "ghost-"+(ghosted))
				fnAreas[i].append(ghost)
				fnHeight += parseFloat(fn.dataset.height) || 0
			}
//			fn.classList.add('ghosted')
		}
		fnAreas[i].parentElement.style.setProperty('--footnoteHeight',fnHeight+"px")
	}
}