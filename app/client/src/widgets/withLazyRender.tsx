import { useEffect, useRef, useState } from "react";
import React from "react";
import BaseWidget, { WidgetProps } from "./BaseWidget";
import { REQUEST_IDLE_CALLBACK_TIMEOUT } from "constants/AppConstants";
import { useSelector } from "react-redux";
import { selectFeatureFlags } from "selectors/usersSelectors";

export function withLazyRender(Widget: typeof BaseWidget) {
  return function WrappedComponent(props: WidgetProps) {
    const features = useSelector(selectFeatureFlags);
    const [deferRender, setDeferRender] = useState(
      !!features.LAZY_CANVAS_RENDERING,
    );
    const wrapperRef = useRef<HTMLDivElement>(null);
    let idleCallbackId: number;
    let observer: IntersectionObserver;

    useEffect(() => {
      if (wrapperRef.current && deferRender) {
        /*
         * For the hidden widgets, we are observing till it,
         *  1. Scrolls into view, or
         *  2. idleCallback is called (browser is either idle or timed out)
         * which ever happens first
         */

        observer = new IntersectionObserver(
          (entries: IntersectionObserverEntry[]) => {
            if (!!entries.find((entry) => entry.isIntersecting)) {
              setDeferRender(false);
              (window as any).cancelIdleCallback(idleCallbackId);
              observer.disconnect();
            } else if (!idleCallbackId) {
              idleCallbackId = (window as any).requestIdleCallback(
                () => {
                  setDeferRender(false);
                  observer.disconnect();
                },
                {
                  timeout: REQUEST_IDLE_CALLBACK_TIMEOUT.lowPriority,
                },
              );
            }
          },
          {
            root: null,
            threshold: 0,
          },
        );

        observer.observe(wrapperRef.current);
      } else {
        setDeferRender(false);
      }

      return () => {
        (window as any).cancelIdleCallback(idleCallbackId);
        observer && observer.disconnect();
      };
    }, []);

    return (
      <Widget {...props} deferRender={deferRender} wrapperRef={wrapperRef} />
    );
  };
}
