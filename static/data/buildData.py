#
# Runs both data building scripts in sequence.
#
import generateResources
import packageConverters

projNames = ["oxygennotincluded"]

for name in projNames:
    generateResources.build(name)
    print("\n")
    packageConverters.build(name)
    # todo: recap of all warnings
