/*
 * Transformer - script.js 
 * Version 1.0
 * Author: Fabio Vitali, 2023
 * All rights reserved. This software is NOT open source at the moment. Permission to use and modify this 
   file is granted to individuals requesting it explicitly to the author. This may change in the future.   
 */

// Globals

var documentLocation = '#file'           // the name of the div containing the loaded document
var paginationClass = '#content'           // the name of the div containing the paged document

var docs = [
	{ "url": "./docs/json/EB137-2015-REC-1.json", "label": "Executive Board 137th Session"},	
	{ "url": "./docs/json/WHA60-2007-REC-1.json", "label": "Sixtieth World Heath Assembly"}	
]
var data

$(document).ready(main);

/* ------------------------------------------------------------------------------ */
/*                                                                                */
/*                                SETUP                                           */
/*                                                                                */
/* ------------------------------------------------------------------------------ */

		function main() {
			layoutSetup() 
			
			// Load document list
			data = docList(docs);

		}
		
		function layoutSetup() {
//			setLayout('width', 3) ;
//			setLayout('height', 100) ;
		}


/* ------------------------------------------------------------------------------ */
/*                                                                                */
/*                                VIEW-RELATED FUNCTIONS                          */
/*                                                                                */
/* ------------------------------------------------------------------------------ */


		function docList(list) {
			var menuItemTpl = 
				`<a class="dropdown-item" href="#" onclick='loadData("{$url}")'>
					{$label}
				</a>`	
			for (var i=0; i<list.length; i++) {
				$('#fileMenu').append(  menuItemTpl.tpl(list[i]) )
			}			
		}
		
		function setLayout(type, value) {
			if (type=="width") {
				var v  = {  v:    parseInt(value)} ;
				var iv = { iv: 12-parseInt(value)} ;
				$('#left')
					.removeClass( (i,c) => { return (c.match (/(col-|fs-)\S+/g)) })
					.addClass( "col-{$v} fs-{$v}".tpl(v))
				$('#right')
					.removeClass( (i,c) => { return (c.match (/(col-|fs-)\S+/g))  })
					.addClass("col-{$iv} fs-{$iv}".tpl(iv))	
			} else {
				var v  = {  v:     parseInt(value)} ;
				var iv = { iv: 100-parseInt(value)} ;
				$('#topPane')
					.removeClass( (i,c) => { return (c.match (/(h-)\S+/g)) })
					.addClass( "h-{$v}".tpl(v))
				$('#bottomPane')
					.removeClass( (i,c) => { return (c.match (/(h-)\S+/g))  })
					.addClass("h-{$iv}".tpl(iv))				
			}
			
		}	
		
/* ------------------------------------------------------------------------------ */
/*                                                                                */
/*                                    UTILS                                       */
/*                                                                                */
/* ------------------------------------------------------------------------------ */


		// the poor man's interpolation function for templates. ©FV
		String.prototype.tpl = function(o,removeAll) { 
			var r = this ; 
			for (var i in o) { 
				r = r.replace(new RegExp("\\{\\$"+i+"\\}", 'g'),o[i]) 
			} 
			if (removeAll) {
				r = r.replace(new RegExp("\\{\\$[^\}]+\\}", 'g'),"") 
			}
			return r 
		}










