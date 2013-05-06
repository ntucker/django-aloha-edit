function listProperties(obj) {
   var propList = "";
   for(var propName in obj) {
      if(typeof(obj[propName]) != "undefined") {
         propList += (propName + ", ");
      }
   }
   alert(propList);
}

Aloha.ready( function() {
	var $ = Aloha.jQuery;
    $('.aloha-edit').aloha();
    $('form').submit(function(){
		$('.aloha-edit', this).each(function (index) {
			var id = $(this).attr('data-id');
			var content = Aloha.getEditableById('aloha-'+id).getContents();
			$('#'+id).attr('value', content);
		});
		//$.post(save_url, content, save_callback);
    });
});
