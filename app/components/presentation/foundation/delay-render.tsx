import { ReactNode, useEffect, useState } from 'react';

/**
 * Layout seems to be pretty expensive especially on our workout component, and it means spawning new  pages have significant delay before it even shows the new page.
 * This component just delays rendering any actual content for one tick, allowing the activity to spawn immediately
 */
export function DelayRender(props: {
  children: ReactNode;
  placeHolder?: ReactNode;
}) {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setRendered(true), 0);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (!rendered) {
    return props.placeHolder ?? <></>;
  }
  return props.children;
}
