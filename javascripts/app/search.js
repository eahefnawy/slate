!function(t){function e(){$("h1, h2").each(function(){var t=$(this),e=t.nextUntil("h1, h2");c.add({id:t.prop("id"),title:t.text(),body:e.text()})})}function i(){r=$(".content"),a=$(".dark-box"),u=$(".search-results"),$("#input-search").on("keyup",n)}function n(t){if(o(),u.addClass("visible"),27===t.keyCode&&(this.value=""),this.value){var e=c.search(this.value).filter(function(t){return t.score>1e-4});e.length?(u.empty(),$.each(e,function(t,e){u.append("<li><a href='#"+e.ref+"'>"+$("#"+e.ref).text()+"</a></li>")}),s.call(this)):(u.html("<li></li>"),$(".search-results li").text('No Results Found for "'+this.value+'"'))}else o(),u.removeClass("visible")}function s(){this.value&&r.highlight(this.value,l)}function o(){r.unhighlight(l)}var r,a,u,l=($(t),{element:"span",className:"search-highlight"}),c=new lunr.Index;c.ref("id"),c.field("title",{boost:10}),c.field("body"),c.pipeline.add(lunr.trimmer,lunr.stopWordFilter),$(e),$(i)}(window);