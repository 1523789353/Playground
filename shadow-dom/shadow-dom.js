class shadowDom {
	constructor(node) {
		if (node instanceof HTMLElement) {
			return new Promise((resolve, reject) => {
				var UID = "_" + Array(32).fill().map(() => "0123456789ABCDEF" [parseInt(Math.random() *
					16)]).join("");
				// 创建shadow-dom
				var shadow = document.body.attachShadow({
					mode: 'closed'
				});
				shadow.innerHTML = `
				<style type="text/css">
					#iframe {
						width: 100%;
						height: 100%;
						margin: 0;
						padding: 0;
						border: none;
					}
				</style>
				<iframe id="iframe" src="about:blank" title="none"></iframe>`;

				var html = `
				<!DOCTYPE html>
				<html>
					<head>
						<meta charset="utf-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1">
					</head>
					<body></body>
					<script id="shadow_init" type="text/javascript">
						window.parent.dispatchEvent(
							new CustomEvent('shadowdom_created', {
								bubbles: false,
								cancelable: false,
								composed: true,
								detail: {
									UID: '${UID}',
									window: window,
									document: window.document,
								}
							})
						);
						
						document.oncontextmenu=()=>false;
						document.querySelector('#shadow_init').remove();
					</script>
				</html>`;

				var done = false, shadow_entry = null;

				addEventListener('shadowdom_created', e => {
					shadow_entry = e.detail;
					resolve(shadow_entry);
				});

				// html转blob对象，生成blobUrl，使用后销毁
				var blob = new Blob([html], {
					type: 'text/html; charset=utf-8'
				});
				var blobUrl = URL.createObjectURL(blob);
				$("#iframe", shadow)[0].contentDocument.write(); // fake dom
				$("#iframe", shadow).attr("src", blobUrl);
				URL.revokeObjectURL(blobUrl);

				done = true;
			});
		} else {
			var err = new TypeError(`${node} not a illegal element`);
			console.error(err);
		}
	}
}
