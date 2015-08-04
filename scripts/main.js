$(function() {
	loadTree();
	loadTable();

	$('#add').click(function() {
		localStorage[$('#folders').val()] = $('#url').val();
		$('#url').val('');
		loadTree();
		loadTable();
	});

	$('#get_bookmarks').click(function() {
		for (var key in localStorage) {
			getUpdatedBookmarks(key);
		}
	});
})


function loadTree() {
	var list = $("#folders");
	list.find('option').remove().end()
	chrome.bookmarks.getTree(function(folders) {
		appendToTree(list, folders[0].children, 0);
	}); 
}

function loadTable() {
	var table = $("#links");
	table.html('');
	for (var key in localStorage) {
		chrome.bookmarks.get(key, function(b) {
			addToLinks(b[0].id, b[0].title, localStorage[b[0].id]);
		});
	};
}

function appendToTree(list, tree, depth) {
	for (var i = 0; i < tree.length; i++) {
		var folder = tree[i];
		if (folder.children !== undefined && localStorage[folder.id] === undefined) { 
			list.append($('<option />').html((depth > 0 ? Array(depth).join("&nbsp;&nbsp;&nbsp;") : '')  + folder.title).val(folder.id));
			appendToTree(list, folder.children, ++depth);
			--depth;
		};
	}
}

function addToLinks(folderId, folderName, url) {
	$("#links").append($('<tr/>')
					.append($('<th/>').html(folderName))
					.append($('<td/>').html(url))
					.append($('<td/>')
						.append($('<input type="button" value="Export"/>')
							.click(function() { exportBookmarks(folderId); }))
						.append($('<input type="button" value="X"/>')
							.click(function() { removeFolder(folderId); }))
					));
}

function removeFolder(folderId) {
	localStorage.removeItem(folderId);
	loadTable();
	loadTree();
}

function exportBookmarks(folderId) {
	chrome.bookmarks.getSubTree(folderId, function(bookmarks) {
		var list = exportItems(bookmarks[0].children);
		var text = JSON.stringify(list);
		copyToClipboard(text);
		alert('Copied to clipboard');
	});
}

function exportItems(items) {
	if (items === undefined) { return; };
	var list = Array();
	for (var i = 0; i < items.length; i++) {
		list.push({ title: items[i].title, url: items[i].url, items: exportItems(items[i].children)});
	}
	return list;
}

function copyToClipboard( text ){
	var copyDiv = document.createElement('div');
	copyDiv.contentEditable = true;
	document.body.appendChild(copyDiv);
	copyDiv.innerHTML = text;
	copyDiv.unselectable = "off";
	copyDiv.focus();
	document.execCommand('SelectAll');
	document.execCommand("Copy", false, null);
	document.body.removeChild(copyDiv);
}

function getUpdatedBookmarks(id) {
	chrome.bookmarks.get(id, function(results) {
		if (chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError.message);
			return;
		}

		$.getJSON(localStorage[id], function(json) {
			console.log('Retrieved updated bookmarks')

			// delete children
			chrome.bookmarks.getChildren(id, function(results) {
				for (child in results) {
					if (results[child].url) {
						chrome.bookmarks.remove(results[child].id)
					}
					else {
						chrome.bookmarks.removeTree(results[child].id)
					}
				}
			})
			
			createBookmarksRecursively(results[0], json)
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	})
}

function createBookmarksRecursively(folder, bookmarks) {
	console.log('Creating bookmarks under folder: ' + folder.title)
	for (b in bookmarks) {
		if (bookmarks[b].url) {
			chrome.bookmarks.create({
				parentId: folder.id,
				title: bookmarks[b].title,
				url: bookmarks[b].url
				},
				function(bm) {
					console.log("added bookmark: " + folder.title + "/" + bm.title + " - " + folder.id + "/" + bm.id);
				});
		}
		else if (bookmarks[b].items) {
			createBookmarkFolder(folder, bookmarks[b].title, bookmarks[b].items)
		}
	}
}

function createBookmarkFolder(parent, title, items) {
	chrome.bookmarks.create({
			parentId: parent.id,
			title: title,
		},
		function(folder) {
			console.log("added folder: " + folder.title + " - " + folder.id)
			createBookmarksRecursively(folder, items)
		})
}