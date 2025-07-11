import { EVENTBRITE_API_KEY } from '$env/static/private';
import type { BikeKitchenEventWithVenue, EventBriteResponse, VenueResponse } from '$lib/types/events.type';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const eventResponse = await fetch('https://www.eventbriteapi.com/v3/organizations/486298958703/events?status=live', {
        headers: {
            'Authorization': `Bearer ${EVENTBRITE_API_KEY}`,
        }
    });

    const locationResponse = await fetch('https://www.eventbriteapi.com/v3/organizations/486298958703/venues', {
        headers: {
            'Authorization': `Bearer ${EVENTBRITE_API_KEY}`,
        }
    });

    let [eventData, venueData]: [EventBriteResponse, VenueResponse] = await Promise.all([eventResponse.json(), locationResponse.json()]);

    // if (process.env.NODE_ENV === 'development') {
    //     eventData.events.push(...fixtureEvents as unknown as BikeKitchenEvent[]);
    // }

    const venueMap = new Map(venueData.venues.map(v => [v.id, v]));

    let events: BikeKitchenEventWithVenue[] = [];

    eventData.events.map(e => {
        let ev = e as BikeKitchenEventWithVenue;
        if (ev.venue_id) {
            ev.venue = venueMap.get(ev.venue_id);
        }
        events.push(ev);
    })

    return {
        events: events
    };
};