

var wallUpdaterTimer = false;
var wallScrollBlock = false;
var wallOldItemsExists = false; 

function wallShareAdd(id)
{
	if(confirm("Θες να το μοιραστείς στο GoSsip σου;")) {
		url = 'wall_ajax.php?cmd=share&id=' + id;
		$.get(
			url,
			function(data){
				if(wallIsAuthOnly(data) == '') {
					return false;
				}
				if(wallItemExists(id, data)) {
					$('.feed_share_' + id).hide();					
					//$('.feed_unshare_' + id).show();
					clearTimeout(wallUpdaterTimer);					
					alert("Δημοσιεύθηκε επιτυχώς στο GoSsip σου!");
					wallUpdater();
				}
			}
		);
	}	
}

function wallUnshare(id, wallItemId)
{
	if(confirm("Είστε σίγουρος;")) {
		url = 'wall_ajax.php?cmd=unshare&id=' + id;
		$.get(
			url,
			function(data){
				if(wallIsAuthOnly(data) == '') {
					return false;
				}
				if(data == 'unshared') {
					$('.feed_unshare_' + id).hide();
					$('.feed_share_' + id).show();
					$('.wall_shared_' + id).remove();
					wallItemExists(0, 'not exists');					
				}
			}
		);
	}	
}

function wallLikeAdd(id)
{
	url = 'wall_ajax.php?cmd=like&id=' + id + '&wall_uid=' + wallUid;
	$.get(
		url,
		function(data){
			if(wallIsAuthOnly(data) == '') {
				return false;
			}
			if(wallItemExists(id, data)) {
				// remove button
				$('#feed_like_' + id).hide();
				// show results
				$('#feed_like_result_' + id).html(data);
				$('#feed_like_result_' + id).show();
			}
		}
	);
}

function wallUnlike(id)
{
	url = 'wall_ajax.php?cmd=unlike&id=' + id + '&wall_uid=' + wallUid;
	$.get(
		url,
		function(data){			
			if(wallIsAuthOnly(data) == '') {
				return false;
			}
			if(wallItemExists(id, data)) {
				// remove button
				$('#feed_like_' + id).show();
				// show results			
				if(trim(data) == '') {
					$('#feed_like_result_' + id).hide();			
					$('#feed_like_result_' + id).html(data);			
				} else {
					$('#feed_like_result_' + id).html(data);			
				}
			}
		}
	);
}

function wallCommentShow(id)
{
	$('.feed_comment_' + id).show();
	document.getElementById('wall_comment_area_' + id).value="";
	document.getElementById('wall_comment_area_' + id).focus();
}

function wallCommentSend(id)
{
	url = 'wall_ajax.php?cmd=comment&id=' + id + '&wall_uid=' + wallUid;
	$('.feed_comment_' + id).hide();
	comment = $('#wall_comment_area_' + id).val();
	$('#wall_comment_area_' + id).val('');
	$.post(
		url,
		{ 'comment' : comment},
		function(data){
			if(wallIsAuthOnly(data) == '') {
				return false;
			}
			if(wallItemExists(id, data)) {
				// add data to the end item	
				itemId = '#wall_item_comments_new_' + id;
				if(wallItemExists(itemId, data)) {
					$(itemId).append(data);
				}
			}
		}
	);
}

function wallItemAdd()
{
	url = 'wall_ajax.php?cmd=item' + '&uid=' + wallUid;
	comment = $('#wall_item_add').val();
	$('#wall_item_add').val('');

	$.post(
		url,
		{ 'comment' : comment},
		function(data){
			if(wallIsAuthOnly(data) == '') {
				return false;
			}
// else choose other item for append
			if(data != 'empty comment') {
                // if item exists - add
                if($('#wall_items_table > tbody > tr:first').length > 0) {
                    $(".first").toggleClass('first firstOld');
                    $('#wall_items_table > tbody > tr:first').before(data);
                } else {
                    $('#wall_items_table > tbody').append(data);
                }
			}
		}
	);
	
	return false;
}

function wallItemDelete(id)
{
	url = 'wall_ajax.php?cmd=item_delete&id=' + id;
	$.get(
		url,
		function(data) {
			if(wallIsAuthOnly(data) == '') {
				return false;
			}
			if(data == 'deleted') {
				wallItemExists(id, 'not exists');
			}
		}
	);
	
	return false;
}

function wallCommentDelete(id)
{
	url = 'wall_ajax.php?cmd=comment_delete&id=' + id;
	$.get(
		url,
		function(data) {
			if(wallIsAuthOnly(data) == '') {
				return false;
			}
			if(data == 'deleted') {
				$('#wall_item_comment_' + id).remove();
			}
		}
	);
	
	return false;
}

function wallItemOld()
{
	$('#load_animation').show();
	url = 'wall_ajax.php?cmd=items_old&id=' + wallLastPostId + '&uid=' + wallUid;
	$.get(
		url,
		function(data){
			if(data != '') {
				$('#wall_items_table > tbody > tr:last').after(data);				
			}
			$('#load_animation').hide();
			wallScrollBlock = false;
		}
	);
}

var wallLastPostId = '';
var wallFirstPostId = 0;
var wallAutoUpdateTimeout = 30000;
var wallUid = '2577';

function wallUpdater()
{
	url = 'wall_ajax.php?cmd=update&last_item_id=' + wallFirstPostId + '&uid=' + wallUid;
	$.get(
		url,
		function(data) {
			data = trim(data);
			if(data != '') {
                if($('#wall_items_table > tbody > tr:first').length > 0) {
                    $(".first").toggleClass('first firstOld');
                    $('#wall_items_table > tbody > tr:first').before(data);
                } else {
                    $('#wall_items_table > tbody').append(data);
                }				
			}
			wallUpdaterTimer = setTimeout('wallUpdater()', wallAutoUpdateTimeout);
		}
	);	
}

function wallItemExists(id, value)
{
	exists = true;
	
	if(value == 'not exists') {
		$('#wall_item_' + id).remove();
		// update class of first table row
		$('#wall_items_table > tbody > tr:first > td').addClass('first');
		$('#wall_items_table > tbody > tr:first > th').addClass('first');
		exists = false;
	}
		
	return exists;
}

function wallIsAuthOnly(value)
{
	if(value == 'please_login') {
		location.href = 'join.php?cmd=please_login';
		value = '';
	}
	
	return value;
}

var itemComments = new Array();

function wallCommentsLoad(id)
{
	url = 'wall_ajax.php?cmd=comments_load&id=' + id + '&last_id=' + itemComments[id] + '&wall_uid=' + wallUid;
	// block comments loading to prevent double load
	$.get(
		url,
		function(data){
			if(wallItemExists(id, data)) {
				// add data to the end item	
				itemId = '#wall_item_comments_' + id;
				if(wallItemExists(itemId, data)) {
					$(itemId).append(data);
				}
			}
		}
	);
}


wallUpdaterTimer = setTimeout('wallUpdater()', wallAutoUpdateTimeout);

   
