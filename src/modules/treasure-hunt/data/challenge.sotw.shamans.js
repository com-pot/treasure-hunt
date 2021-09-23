export default {
    "zebras": [
      {
        "name": "deer",
        "helpText:": "",
        "rules": []
      },
      {
        "name": "bear",
        "helpText:": "",
        "rules": [
          ["within", 1, ["includes", "wolf"]],
          ["within", 1, ["!includes", "cougar"]],
          ["within", 1, ["!includes", "bison"]]
        ]
      },
      {
        "name": "owl",
        "helpText:": "",
        "rules": [
          ["within", 1, ["includes", "deer"]],
          ["within", 1, ["!includes", "bear"]],
          ["within", 1, ["!includes", "fox"]]
        ]
      },
      {
        "name": "cougar",
        "helpText:": "",
        "rules": [
          ["within", 1, ["!includes", "fox"]],
          ["within", 1, ["!includes", "owl"]]
        ]
      },
      {
        "name": "fox",
        "rules": []
      },
      {
        "name": "wolf",
        "helpText:": "",
        "rules": [
          ["within", 1, ["includes", "cougar"]],
          ["within", 1, ["!includes", "deer"]],
          ["within", 1, ["!includes", "bison"]]
        ]
      },
      {
        "name": "bison",
        "helpText:": "",
        "rules": [
          ["within", 1, ["!includes", "wolf"]],
          ["within", 1, ["!includes", "cougar"]],
          ["within", 1, ["includes", "owl"]],
          ["before", ["!includes", "bear"]]
        ]
      }
    ]
  }
  