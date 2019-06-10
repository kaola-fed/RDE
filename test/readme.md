### 测试说明

在测试前，先创建新的docker环境
1. docker-machine create --driver virtualbox rde-test
2. eval "$(docker-machine env rde-test)"

结束后还原环境：
1. docker-machine stop rde-test
2. eval "$(docker-machine env -u)"
3. docker-machine rm rde-test
 
