file=$1

if [ "$file" == "lambda" ]; then
    rm index.zip
    cd lambda 
    zip ../index.zip * -X -r
    cd .. 
    aws lambda update-function-code --function-name salaryCalculator --zip-file fileb://index.zip
fi

if [ "$file" == "lambda-dynamo" ]; then
    rm index.zip
    cd lambda-dynamo
    zip ../index.zip * -X -r
    cd ..
    aws lambda update-function-code --function-name lightStatusUpdater --zip-file fileb://index.zip
fi

if [ "$file" == "lambda-stream" ]; then
    rm index.zip
    cd lambda-stream
    zip ../index.zip * ../node_modules -X -r
    cd ..
    aws lambda update-function-code --function-name streamReader --zip-file fileb://index.zip
fi