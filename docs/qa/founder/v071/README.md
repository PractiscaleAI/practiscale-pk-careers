# Founder framing repair, revision 0.71

The pale side bands came from a contained thumbnail interpolating toward a viewport with a different aspect ratio. Black side bands were the expanded player's contained video against its black backing.

The thumbnail now covers the measured aperture at every scroll position with uniform scaling. The complete artwork remains visible initially. The enhanced video covers its viewport without stretching; this intentionally crops outer footage on mismatched screens. Original assets, source selection, native fallback fitting, preview shadow, and playback/recovery timing remain unchanged.

Production webpack build and TypeScript pass. Playback/coverage suite: 134/134 checks across 1440x900, 1900x910, 1366x600, 768x1024, 390x844, 360x640 and 844x390, including initial artwork preservation, six intermediate edge-coverage checks per enhanced layout, playback handoff, reverse pause and delayed-media behavior. Screenshots retain initial, expanding and playing states. These are desktop Chrome/emulated viewport checks, not physical iOS/Safari certification.

Preview: http://127.0.0.1:3000/?review=v071-founder-fit#background-lines
