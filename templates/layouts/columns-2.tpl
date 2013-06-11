	
<% _.each(layout, function (row, rowNumber) { %>
	<% _.each(row, function (defs, key) { %>
		<%
			var tag = 'tag' in defs ? defs.tag : 'div'; 
			print( '<' + tag);
			if ('id' in defs) {
				print(' id="'+defs.id+'"');
			}
			if ('class' in defs) {
				print(' class="'+defs.class+'"');
			} ;
			print(' style="float: left; width: 50%;"');
			print('>');
		%>
			{{{<%= defs.name %>}}}
			<%= '</' + tag + '>' %>		
	<% }); %>
	<br style="clear: left;">
<% }); %>
