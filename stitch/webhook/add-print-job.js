// This function is the webhook's request handler.
exports = function(payload, response) {
  // Data can be extracted from the request as follows:

  // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
  const { arg1, arg2 } = payload.query;

  // Headers, e.g. {"Content-Type": ["application/json"]}
  const contentTypes = payload.headers["Content-Type"];

  // Raw request body (if the client sent one).
  // This is a binary object that can be accessed as a string using .text()
  const body = payload.body;

  console.log("arg1, arg2: ", arg1, arg2);
  console.log("Content-Type:", JSON.stringify(contentTypes));
  console.log("Request body:", JSON.stringify(body.text()));

  const content = body.text();
  const contentJson = EJSON.parse(content);

  // You can use 'context' to interact with other Stitch features.
  // Accessing a value:
  // var x = context.values.get("value_name");

  // Querying a mongodb service:
  let newDoc = {
    text: contentJson.jobContent,
    isPrinted: false,
    dateCreated: new Date()
  };

  const doc = context.services
    .get("mongodb-atlas")
    .db("printer")
    .collection("jobs")
    .insertOne(newDoc);

  // Calling a function:
  // const result = context.functions.execute("function_name", arg1, arg2);

  // The return value of the function is sent as the response back to the client
  // when the "Respond with Result" setting is set.
  return "OK";
};
