<tr>	
<% _.each(layout, function (defs, key) { %>
	<td>
		<%
			var tag = 'tag' in defs ? defs.tag : 'div';
			print( '<' + tag);
			if ('id' in defs) {
				print(' id="'+defs.id+'"');
			}
			if ('class' in defs) {
				print(' class="'+defs.class+'"');
			};
			print('>');
		%>
			{{{<%= defs.name %>}}}
		<%
			print( '</' + tag + '>');
		%>
	</td>
<% }); %>
</tr>
