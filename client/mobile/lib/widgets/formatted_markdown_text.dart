import 'package:flutter/material.dart';

class FormattedMarkdownText extends StatelessWidget {
  final String text;
  final TextStyle? baseStyle;
  final Color? boldColor;

  const FormattedMarkdownText({
    super.key,
    required this.text,
    this.baseStyle,
    this.boldColor,
  });

  @override
  Widget build(BuildContext context) {
    final style = baseStyle ??
        const TextStyle(
          fontSize: 14.5,
          height: 1.45,
          color: Color(0xFF1E293B),
          fontWeight: FontWeight.w400,
        );

    final lines = text.split('\n');
    final widgets = <Widget>[];

    for (int i = 0; i < lines.length; i++) {
      final line = lines[i].trimRight();

      if (line.trim().isEmpty) {
        if (i > 0 && i < lines.length - 1) {
          widgets.add(const SizedBox(height: 6));
        }
        continue;
      }

      // Check for header
      if (line.trimLeft().startsWith('### ') || line.trimLeft().startsWith('## ')) {
        final headerContent = line.trimLeft().replaceFirst(RegExp(r'^#{2,3}\s*'), '');
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(top: 6, bottom: 4),
            child: RichText(
              text: TextSpan(
                children: _parseInlineMarkdown(
                  headerContent,
                  style.copyWith(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ),
            ),
          ),
        );
        continue;
      }

      // Check for bullet list item
      final isBullet = line.trimLeft().startsWith('* ') ||
          line.trimLeft().startsWith('- ') ||
          line.trimLeft().startsWith('• ');

      // Check for numbered list item
      final numberedMatch = RegExp(r'^(\d+)\.\s*(.*)').firstMatch(line.trimLeft());

      if (isBullet) {
        final content = line.trimLeft().replaceFirst(RegExp(r'^[\*\-•]\s*'), '');
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 7, right: 8),
                  width: 5,
                  height: 5,
                  decoration: BoxDecoration(
                    color: boldColor ?? const Color(0xFF0284C7),
                    shape: BoxShape.circle,
                  ),
                ),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      children: _parseInlineMarkdown(content, style),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      } else if (numberedMatch != null) {
        final numStr = numberedMatch.group(1)!;
        final content = numberedMatch.group(2)!;
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(left: 2, bottom: 5),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 2, right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0F2FE),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    numStr,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0369A1),
                    ),
                  ),
                ),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      children: _parseInlineMarkdown(content, style),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      } else {
        // Normal paragraph
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: RichText(
              text: TextSpan(
                children: _parseInlineMarkdown(line, style),
              ),
            ),
          ),
        );
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: widgets,
    );
  }

  List<InlineSpan> _parseInlineMarkdown(String raw, TextStyle base) {
    final spans = <InlineSpan>[];
    // Regex matches **bold**, *italic*, or plain text
    final regex = RegExp(r'(\*\*([^*]+)\*\*|\*([^*]+)\*|([^*]+))');
    final matches = regex.allMatches(raw);

    for (final match in matches) {
      if (match.group(2) != null) {
        // **bold**
        spans.add(
          TextSpan(
            text: match.group(2),
            style: base.copyWith(
              fontWeight: FontWeight.w700,
              color: boldColor ?? const Color(0xFF0F172A),
            ),
          ),
        );
      } else if (match.group(3) != null) {
        // *italic*
        spans.add(
          TextSpan(
            text: match.group(3),
            style: base.copyWith(
              fontStyle: FontStyle.italic,
              color: base.color?.withValues(alpha: 0.85),
            ),
          ),
        );
      } else if (match.group(4) != null) {
        // Plain text
        spans.add(
          TextSpan(
            text: match.group(4),
            style: base,
          ),
        );
      }
    }

    return spans;
  }
}
