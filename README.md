To see the old repository, see https://github.com/k-henr/resource-calc-old. The old repository is archived as of 2026-09-09, since I chose to move to Sveltekit for better routing support.

# Graph creation documentation

## Config

All graphs need a config file, which determines some basics like unit groups.

Units are handled by assigning every resource a "unit group", which is what I call a quantity. Unit groups can then contain a number of units, with conversion factors to the base unit which is what the system uses internally. A user can then choose any unit in a resource's group when entering resource sources/drains, as well as when using the "UNIT" setting on converters, and the program will automatically convert to the base unit for calculations.

This is the current syntax for the config file:

```json
{
	"legalDisclaimer": "A graph-specific legal notice to comply with guidelines/licenses.",
	"unitGroups": [
		// A list of different unit groups
	],
	"defaultUnitGroup": "mass/time"
}
```

An example of a unit group:

```json
[
    "power",
    {
        "default": "W",
        "conversions": [
            ["kW", 1000],
            ["MW", 1000000],
            ["mW", [1, 1000]] // Numbers can also be rationals by writing like this.
        ]
    }
],
```

## Converters

Converters are stored in JSON. The "consumes" and "produces" lists can contain resource references as well as boolean operators (OR or AND), which enable complex converters that can consume different things. Additionally, they can be modified by settings using AST trees, which enables complex converter logic.

### Converter JSON syntax

The `displayName` of the converter is used once a converter has been finalized (with settings), which allows for using additional setting-dependent formatting. In the example, the `displayName` may for example end up displaying as `"Combustion Generator, efficiency=1.5"` if the setting is set to `1.5`. The thumbName is used before finalization, when settings can still change. If no thumb name is specififed, the display name is used instead.

Example:

```json
{
	"tags": ["Power"], // tags are optional
	"id": "combustion_generator",
	"displayName": "Combustion Generator, efficiency={Efficiency boost}", // display name is optional
	"thumbName": "Combustion Generator",
	"displayImage": "images/combustion_generator.png",
	// settings are optional
	"settings": [
		{
			"type": "NUMBER",
			"name": "Efficiency boost",
			"default": 1
		}
	],
	"consumes": [
		{
			"type": "OR",
			"resources": [
				{
					"type": "RESOURCE",
					"id": "wood",
					"amount": 100 // in whatever the default unit for wood is
				},
				{
					"type": "RESOURCE",
					"id": "coal",
					"amount": 50
				}
			]
		}
	],
	"produces": [
		{
			// An example of defining a modifier dependent on a number input
			"type": "MODIFIER",
			"modifier": {
				"type": "NUMBER",
				"name": "Efficiency boost"
			},
			"resource": {
				"type": "RESOURCE",
				"id": "electricity",
				"amount": 60
			}
		}
	]
}
```

All converters are stored in a list in a single JSON file. There's a script `packageConverters.py` to help with this, with some additional functionality (see [details here](dataStorage.md#ConverterPython))

#### Setting types:

These are the "definitions" of the settings, and are placed in the "settings" list. Do not mix up with setting **AST nodes**, which refer to these but are distinct.

**type = NUMBER**: this represents a number input setting, which will be added to a form when adding the converter and has any range. The default value of the element will equal the specified default of the first occurence.

As with other numbers, this has support for rational numbers.

```json
{
	"type": "NUMBER",
	"name": "Efficiency boost",
	"default": 1, // Or use a rational here
	"unit": "kg/s" // Optional extra, will be displayed after the input element
}
```

**type = TOGGLE**: Choose one of two options depending on if a toggle is on. The default value of the element will equal the specified default of the first occurence.

```json
{
	"type": "TOGGLE",
	"name": "Efficiency boost?",
	"true": {
		// Any AST node
	},
	"false": {
		// Any AST node
	}
}
```

**type = ENUMERATE**: Contains a number of options, which will be added to the settings form as a dropdown. Depending on which option was chosen, the associated branch will be chosen when evaluating this node.

Multiple options can also map to the same node by replacing an option's name by a list of names instead.

```json
{
	"type": "ENUMERATE",
	"name": "Efficiency boost",
	"options": [
		{ "name": "None", "value": 1 },
		{ "name": "Small", "value": 1.2 },
		{ "name": "Large", "value": 1.5 },
		// The value fields can be filled with any AST node:
		{
			"name": "Custom",
			"value": {
				"type": "NUMBER",
				"name": "Custom efficiency",
				"default": 1
			}
		}
	],
	"default": "None"
}
```

#### Resource tree nodes:

**type = RESOURCE**: A leaf on the tree. This represents a certain amount of a certain resource:

```json
{
	"type": "RESOURCE",
	"id": "water",
	"amount": 5
}
```

**type = CONVERTER**: Another leaf node, which allows referring to another converter's input tree. This tree then has to be resolved in a separate step before the converter is added. This can be used where one converter inhibits another, for example if an animal consumes a plant and the plant would otherwise be producing other things.

The `amount` determines how many converters are inhibited. In cases where the amount varies depending on the settings of the secondary converter (example: A cow eats either 2 healthy grass patches or 4 blighted ones, and "blighted" is a setting on the Grass Patch converter), it can be replaced by a settings AST, which then takes information from the settings of the secondary converter.

The `amountPreview` field is a simple rational number saying which number should be displayed in the tree. This won't always match the final amount, since the final amount depends on the settings of the dependency (which don't get resolved until later).

```json
{
	"type": "CONVERTER",
	"id": "plant",
	"amount": 2,
	"amountPreview": 2
}
```

Another example, where the `amount` field is a settings tree. The setting should exist on the `"tree"` converter referenced by the `id` field. In this instance, the converter would only need 5 oaks, but 7 elms.

```json
{
	"type": "CONVERTER",
	"id": "tree",
	"amount": {
		"type": "SETTING",
		"name": "Species",
		"options": [
			["Oak", 5],
			["Elm", 7]
		]
	}
}
```

_Note: If you also want the number of converters required to depend on the settings of the original converter, you can simply put this node inside a MULTIPLIER node, same as you'd do with a RESOURCE node._

**type = AND**: A list of multiple resources, all of which will be part of the final tree.

```json
{
	"type": "AND",
	"resources": [
		// A list of other tree nodes goes here!
	]
}
```

**type = OR**: A list of multiple resources, where the user can choose one of the options which will then be used.

```json
{
	"type": "OR",
	"resources": [
		// A list of other tree nodes goes here!
	]
}
```

**type = ENTANGLED_OR**: Like an OR node, except when one is collapsed, all other `ENTANGLED_OR` nodes with the same name are also collapsed to the option with the same name.

Options in an ENTANGLED_OR are stored as `[string|string[], ResourceTree]` pairs to give a name to every option, meaning that `resources` is a list of lists.

```json
{
	"type": "ENTANGLED_OR",
	"resources": [
		// A list of other tree nodes goes here!
	]
}
```

**type = TAG**: A list of all resources with the given tag. If this sits inside of an OR node, it gets merged with the OR node and behaves as if it was replaced by a bunch of RESOURCE nodes. If it's not in an OR node, it behaves as an OR itself, letting you choose any resource with the given tag.

```json
{
	"type": "TAG",
	"tagName": "Liquid",
	"amount": 50
}
```

**type = MULTIPLIER**: A multiplier, which evaluates user settings from its "multiplier" field, which consists of an AST tree defining a mathematical formula, see below. This multiplier will then apply to the child tree. All settings generated from all AST trees in the converter are combined into a single form, where settings with the same name need to have the same type.

```json
{
	"type": "MULTIPLIER",
	"multiplier": {
		// An AST tree defining an efficiency formula
	},
	"resource": {
		// A resource tree node that the multiplier applies to
	}
}
```

#### Multiplier AST nodes:

**number**: a float or a rational.

```json
3 // represents 3
```

```json
6.28 // represents 6.28, or 628/100
```

```json
[2, 7] // represents 2/7
```

**type = SETTTING**: this ties the given node with a setting. Depending on the type of the setting (as defined using the setting types above), this node requires different additional properties.

```json
{
	"type": "SETTING",
	// "name" is used to link this node to a setting defined in the settings list
	"name": "Efficiency boost"
}
```

The above example is for a number setting, which requires no additional fields and simply returns the number entered by the user.

- If the setting referred to is a **toggle** setting, the additional properties `true` and `false` are required. These are AST nodes that will be chosen if the checkbox is on or off, respectively.
- If the setting referred to is an **enumerate** setting, the additional property `options` is required. This is a list of `[string|string[], AstNode]` list pairs, where the first element is the option or options that will result in the branch being chosen, and the second element is the branch in question.

**type = MUL**: Multiply the given list of AST nodes together.

```json
{
	"type": "MUL",
	"values": [
		// A list of AST tree nodes to multiply together
	]
}
```

**type = DIV**: Divide the numberator with the denominator.

```json
{
	"type": "DIV",
	"value1": {
		// AST tree node, dividend
	},
	"value2": {
		// AST tree node, divisor
	}
}
```

**type = ADD**: Add the list of AST nodes together.

```json
{
	"type": "ADD",
	"values": [
		// A list of AST tree nodes to add together
	]
}
```

**type = SUB**: Subtract the second node from the first.

```json
{
	"type": "SUB",
	"value1": {
		// AST tree node, minuend
	},
	"value2": {
		// AST tree node, subtrahend
	}
}
```

**type = POW**: Raise the first term to the power of the second.

```json
{
	"type": "POW",
	"value1": {
		// AST tree node
	},
	"value2": {
		// AST tree node
	}
}
```

**type = CLAMP**: Clamp the given value between two other values. All of the values are evaluated as AST:s, so the `low` and `high` values can also be complex.

```json
{
	"type": "CLAMP",
	"value": 50,
	"low": 0,
	"high": 100
}
```

### Converter assembly using Python {#ConverterPython}

As mentioned previously, there's a build script which can combine a number of individual files into a single, minified JSON file. Additionally, these values can be inferred by this script:

- `id`: inferred from the filename.
- `displayName`: inferred from the filename, replacing `_` with ` ` and capitalizing words.
- `displayImage`: Inferred from the filename, pointing to a file in `/images/converters` (configurable), with the extension `defaultImgExt`. Additionally, all tags in the directory paths are stripped away, meaning that `/unpacked-converters/subdirectory.+Tag 1.Tag 2+/converter.json` would get the `displayImage` `/images/converters/subdirectory/converter.png`.

#### Templates

Sometimes, many converters share the same basic structure, settings and ASTs. In order to cut down on repeated code, there's a template system for this. Add a template in `/templates` (or the configured template directory). These are defined like any converter, except any part of it can be replaced by the string `"TEMPLATE:name"` (where `name` is replaced by the name of this particular "template string", used for identification). A converter in the converter directory can then define a property `"templateName"`, which should be the same as the filename ( not including the `.json` extension). Then, the converter will act as a dictionary for what to replace the different parts with.

Additionally, a `?` can be appended after the `TEMPLATE`, which makes a template string optional. If nothing is defined for this template string, it will simply be skipped.

`...` can also be appended in front of the `TEMPLATE` like `...TEMPLATE`, which causes the node that goes there to automatically insert its elements into the parent list, in case both the parent and the child are lists.

Example:

A template may look like this (let's say it's in a file named "productionBuilding.json"):

```json
{
	"tags": ["Production", "...TEMPLATE?:moreTags"],
	"settings": [
		{ "type": "TOGGLE", "name": "Overclocked", "default": false },
		"...TEMPLATE?:moreSettings"
	],
	"consumes": [
		"...TEMPLATE:ingredients",
		{
			"type": "MULTIPLIER",
			"multiplier": "TEMPLATE:powerUsage",
			"resource": {
				"type": "RESOURCE",
				"id": "power",
				"amount": "1"
			}
		}
	],
	"produces": [
		{
			"type": "MULTIPLIER",
			"multiplier": {
				"type": "SETTING",
				"name": "Overclocked",
				"true": 1.5,
				"false": 1
			},
			"resource": "TEMPLATE:products"
		}
	]
}
```

This has five template strings: One for adding more tags to the building (other than the predefined "Production" tag), one for adding more settings, one for setting the power usage, and two for defining the actual inputs and outputs. All converters using this template will have an "overclocked" setting which multiplies all produced resources by 150%, and will have the "Production" tag. Optionally, more tags and settings may be provided.

A minimal example of a converter implementing this template:

```json
{
	"templateName": "productionBuilding",
	"ingredients": [
		{
			"type": "RESOURCE",
			"id": "wood",
			"amount": 15
		}
	],
	"products": [
		{
			"type": "RESOURCE",
			"id": "planks",
			"amount": 10
		}
	],
	"powerUsage": 150
}
```

Or a more complex converter implementing the same template:

```json
{
	"templateName": "productionBuilding",
	"moreTags": ["Magic", "Flying"],
	"moreSettings": [{ "type": "NUMBER", "name": "Altitude", "default": 0 }],
	"ingredients": [
		{
			"type": "RESOURCE",
			"id": "clay",
			"amount": [17, 20]
		},
		{
			"type": "RESOURCE",
			"id": "gems",
			"amount": [3, 20]
		}
	],
	"products": [
		{
			"type": "RESOURCE",
			"id": "golem",
			"amount": 1
		}
	],
	"powerUsage": {
		"type": "SUB",
		"value1": 180,
		"value2": {
			"type": "SETTING",
			"name": "Altitude"
		}
	}
}
```

This example adds two extra tags, Magic and Flying. It also adds an extra setting, Altitude. Since these template strings are optional, they don't need to be specified in the minimal example, and since they're flattening themselves into their parent list, the contents of these lists will be put into the list where the template string was (`[a, b, c]`), rather than causing nesting (`[a, [b, c]]`).

Note that the `powerUsage` template string was placed in a `MULTIPLIER` node when the template was defined. This means that anything that the `powerUsage` template string gets replace by will be interpreted as an AST, letting us do things like settings-based power consumption. If this isn't necessary, the `amount` property on the `RESOURCE` node could be used instead for the same effect (but that would make this second example invalid, as it assumes that `powerUsage` refers to an AST)

_Templates can theoretically be chained, but I haven't tested this yet._

## Resources

Resources have an ID, a name and an image, which are simply stored in text form in a file.

Example:

```json
{
	"id": "wood",
	"tags": ["Tag 1", "Tag 2"],
	"displayName": "Wood",
	"displayImage": "images/items/wood.png",
	"unitGroup": "units_over_time"
}
```

`tags` and `unitGroup` are optional.

Same as with converters, all resources have to be stored in a single file. There's a python script that can automatically generate this file from the filenames of images in a specified folder, by writing information info the filename, separated by `.` following this syntax:

```txt
id_and_name.unit_group.#tag1.tag2.tag3#.png
```

Any image file extension works, and the unit group and tag groups are optional. The name will be generated from the id by replacing `_` with ` ` and capitalizing all words. There can be any number of tags.

Additionally, tags and unit groups can be added to folder names, and will then apply to all files within that folder (or any subdirectory). If multiple unit groups are present for a given file, the last one applies. **this can also be used for converters.**
