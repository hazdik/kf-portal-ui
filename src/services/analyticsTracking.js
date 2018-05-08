import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { gaTrackingID } from 'common/injectGlobals';
import { merge } from 'lodash';

const debug = process.env.NODE_ENV === 'development';

let GAState = {
    trackingId: 'UA-87708930-5',
    userId: null,
    clientId: null
};

let modalTimings = {};

let setUserDimensions = userId => {
    ReactGA.set({ clientId: GAState.clientId });

    if (userId || GAState.userId) {
        ReactGA.set({ userId: userId || GAState.userId });
    }
};

export const addStateInfo = obj => merge(GAState, obj);

export const initAnalyticsTracking = () => ReactGA.initialize(GAState.trackingId, { debug });

export const trackUserSession = async ({ _id, acceptedTerms }) => {
    ReactGA.ga(function(tracker) {
        var clientId = tracker.get('clientId');
        addStateInfo({ clientId });
    });
    let userId = _id;
    if (acceptedTerms && !GAState.userId) {
        setUserDimensions(userId);
        addStateInfo({ userId });
        return true;
    } else {
        return false;
    }
};

export const trackUserInteraction = async eventData => {
    setUserDimensions();
    ReactGA.event(eventData);
    switch (eventData.category) {
        case 'Modals':
            if (eventData.action === 'Open') {
                modalTimings[eventData.label] = {
                    open: +new Date(),
                    close: null,
                    duration: 0,
                };
            } else if (eventData.action === 'Close') {
                let modal = modalTimings[eventData.label];
                modal.close = +new Date();
                modal.duration = modal.close - modal.open;
                trackTiming({
                    category: 'Modals',
                    variable: 'open duration',
                    value: modal.duration, // in milliseconds
                    label: eventData.label,
                });
            }
            break;
        default:
            break;
    }
};

export const trackTiming = async eventData => {
    setUserDimensions();
    ReactGA.timing(eventData);
};

export const trackPageView = (page, options = {}) => {
    setUserDimensions();
    ReactGA.set({
        page,
        ...options,
    });
    ReactGA.pageview(page);
};

export function withPageViewTracker(WrappedComponent, options = {}) {
    const HOC = class extends Component {
        componentDidMount() {
            const { pathname, hash, search } = this.props.location;
            trackPageView(pathname + hash + search);
        }

        componentWillReceiveProps(nextProps) {
            const currentPage = this.props.location.pathname;
            const nextPage = nextProps.location.pathname;

            if (currentPage !== nextPage) {
                const { pathname, hash, search } = this.props.location;
                trackPageView(pathname + hash + search);
            }
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };

    return HOC;
}
