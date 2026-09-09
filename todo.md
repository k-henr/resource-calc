Links:
[ONI](http://127.0.0.1:5500/#oxygennotincluded)
[Mindustry](http://127.0.0.1:5500/#mindustry)

# TODO

## ONI data

### APP

- Stuff not yet on the wiki (look up in-game):
    - Vulcanizer
    - Update brackwax image

## Cleanup

- Check if it'd be easy to move to sveltekit. I feel like it _should_ be, but I'm probably wrong? If it's easy enough to warrant doing, move to a routing system instead of hashes with the game as a slug instead of a hash
    - Alternatively, wait with this until I have a server running in order to avoid the prerendering stuff
- Make a proper readme with some info from [dataStorage.md](dataStorage.md)
    - Check [types.ts](scripts/types.ts) for stuff I forgot to document
- Start hosting on GHP! (set up CNAME for `resourcecalc.khenr.se`)
- Move further TODOs to github issues (and never touch them again)

## Additional fanciness (to be dealt with in github issues)

### Data

- Proper type checking! Right now graph errors can often result in ProgramErrors being thrown, which is due to my poor JSON handling. Add type guards for the loaded JSON in order to make sure that everything's in ordder right at the start
- Upgrade to hjson for unpacked converters? If my python can parse that it'd be easy
- Work towards adding all phase transitions
- At least a partial solution for extracting data directly from the game files? Might be possible for resources, probably a lot harder for converters
- Model heat in ONI? Something like "free heat" and "trapped heat", where an AT moves between and stuff takes trapped/free heat or summat. Would be hard to model inputs and outputs exchanging heat though
- Add solar panels. They're annoying since their ASTs would need to be incredibly complex (sin, Σ and π) which doesn't lend itself great to rational numbers
- Converters from food to rot piles. This depends on the foods' caloric density, so it'll probably require a big OR with different amounts on each (meaning TAGs aren't possible). Or I could add support for secondary units for resources, which would probably be the better way to do this
- Move template functionality into the actual page to avoid sending lots of duplicate JSON data
- Resize all images to something like at most 64\*64 using python? (also most of them are actually `webp`s and not png (but some are `png`s), use `webp` as the image extension for ONI instead? Or convert to `png`)

### Functionality

- Readd the nothing node again to both avoid stupid stuff like `{"type":"AND","resources":[]}` and to have safer OR nodes
- Allow for writing ASTs directly into resource nodes' amounts, and make the multiplier work like an AND node instead?
- Can I get `EntangledOrNode` to not rely on `IntermediateConverter`? If so, I can get rid of the export for the `resourceTreeDataToClass` completely and build the trees before constructing the converter. I'd still want to reconstruct the trees every time though due to tracking of created elements.
- A resource node that lets me specify a list of IDs all with the same amounts, like TAG but arbitrary
- If the filtering by ingredients and products gets too slow, I could construct a map from resources to their producers/consumers at the start
- Can I use `pattern` attributes and `:valid` CSS selectors to simplify the error feedback on rational inputs? I don't use FormData stuff, and if it only validates when using forms this won't work. Maybe I should use form.validate instead of throwing errors during parsing anyways? Either way it'd be nice to avoid having to lug aroung the form element when it's only really the FormData stuff that I need
- Converter presets, i.e. "hatch ranch" automatically adding X number of happy hatches and evolving the surplus?
- Exporting and importing projects to json files? Or a full database if I host it myself at some point
- Automatically discover "unnecessary" processes and display ways to increase efficiency?
- The ability to add a "resource cache" and see how long it'd take until it's exhausted (or the same but for producing a given amount of a resource)
- Different converter images depending on settings, like with display names?
- Min/max value support for number settings
- New RANGE setting for converter, working in user-defined increments, displaying as a slider and having a rational display
- Allow for inverted units (i.e. s/kg instead of kg/s)
- Support for entering different units in number settings as well. Make the "unit" field on number inputs actually handle units?
- Automatically collapse ORs with only one option
- Proper JSON validation to catch graph errors early
- Rational number parser currently parses `7.5/30` as `7.0 5/30`. Make it throw an error at least?

### UI

- Add a hub page for when the hash is empty where you can choose any other places to go. Should use a completely different HTML page, which might be difficult? Maybe moving to Svelte would be sensible
- Support descriptions as well as links to wiki articles for converters/resources
- Better formatting in display names
    - Boolean operators (`{Bottomless Stomach+Mouth Breather|Really bad} dupe`)
    - Choosing text for enumerables and numbers (`{a<5|small}{10<a|big}{5<=a<=10|normal}` for numbers?)
    - `OR` choices could show up (at least entangled ones)?
- When adding a converter from a resource drain, add an option at the top to add the required item as an item source instead
- Tooltip system? As in, when hovering over an interactive element of the page it displays a description of what that element does
- Toggles enabling/disabling converters and resources (for DLCs, serpulo/erekir, common mods etc)
- Dynamic color scheme and favicon per-graph. If I get sveltekit to work this should be easy (by moving the colour definitions to a separate file and linking to different stylesheets depending on the slug)
- If no tags are specified through the whole project, don't add the "miscellaneous" folder and just shove everything into the root
