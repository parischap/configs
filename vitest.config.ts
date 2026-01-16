export default {
  "test": {
    "projects": [
      {
        "test": {
          "exclude": [
            "node_modules/**"
          ],
          "fileParallelism": false,
          "include": [
            "tests/*.ts"
          ],
          "isolate": false,
          "name": "Repo configs",
          "pool": "threads"
        }
      }
    ]
  }
}