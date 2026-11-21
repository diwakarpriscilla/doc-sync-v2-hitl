import html


def render_markdown(markdown: str) -> str:
    escaped = html.escape(markdown)
    return "<ac:structured-macro ac:name=\"markdown\"><ac:plain-text-body><![CDATA[" + escaped + "]]></ac:plain-text-body></ac:structured-macro>"
