import React, { Fragment } from 'react';
import { Text, StyleProp, TextStyle, TextProps } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

interface LimitedHtmlProps {
  value: string;
  emStyles?: StyleProp<TextStyle>;
}

interface ParsedSegment {
  isHighlighted: boolean;
  text: string;
  insertBreakBefore: boolean;
}

export default function LimitedHtml({
  value,
  emStyles,
  ...rest
}: LimitedHtmlProps & TextProps) {
  const { colors } = useAppTheme();

  const parseLimitedHtml = (): ParsedSegment[] => {
    const segments: ParsedSegment[] = [];
    let currentIndex = 0;
    let closed = true;
    const HIGHLIGHT_TAG = '<em>';
    const HIGHLIGHT_TAG_CLOSING = '</em>';

    while (currentIndex < value.length) {
      const findTag = closed ? HIGHLIGHT_TAG : HIGHLIGHT_TAG_CLOSING;
      const index = value.indexOf(findTag, currentIndex);

      if (index === -1) {
        // No more tags found, process remaining text
        const remainingText = value.substring(currentIndex);
        const textToProcess = !closed
          ? HIGHLIGHT_TAG + remainingText
          : remainingText;

        // Split on <br> and return each part
        const parts = textToProcess.split('<br>');
        for (let i = 0; i < parts.length; i++) {
          segments.push({
            isHighlighted: !closed,
            text: parts[i],
            insertBreakBefore: i > 0, // First part doesn't need a break before it
          });
        }
        break;
      }

      // Process text up to the next tag
      const innerText = value.substring(currentIndex, index);
      if (innerText.length > 0) {
        // Split on <br> and add each part
        const parts = innerText.split('<br>');
        for (let i = 0; i < parts.length; i++) {
          segments.push({
            isHighlighted: !closed,
            text: parts[i],
            insertBreakBefore: i > 0, // First part doesn't need a break before it
          });
        }
      }

      closed = !closed;
      currentIndex = index + findTag.length;
    }

    return segments;
  };

  const segments = parseLimitedHtml();

  // Default highlighted style with theme colors
  const defaultHighlightedStyle = {
    fontWeight: 'bold',
    color: colors.primary,
  } as const;

  return (
    <Text {...rest}>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {segment.insertBreakBefore && '\n'}
          <Text
            style={[
              segment.isHighlighted
                ? emStyles || defaultHighlightedStyle
                : undefined,
              rest.style,
            ]}
          >
            {segment.text}
          </Text>
        </Fragment>
      ))}
    </Text>
  );
}
