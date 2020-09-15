#docker build -t node .
docker container rm -f okcupid_automation
docker run -dit --shm-size=1gb --name okcupid_automation --restart always -v /media/usb/projects/Node_OKCupidAutomation/:/app node
