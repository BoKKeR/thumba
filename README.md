<img src="https://github.com/BoKKeR/thumba/raw/master/thumba.png" alt="thumba" width="200"/>

![Docker Pulls](https://img.shields.io/docker/pulls/bokker/thumba) ![Docker Stars](https://img.shields.io/docker/stars/bokker/thumba) ![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/BoKKeR/thumba/master/master) ![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/bokker/thumba/latest) 
<a href="https://www.buymeacoffee.com/bokker" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

# Thumba
A self hosted Thumbnail generator/finder which creates thumbnails based on folder names and google search results.

## Description

This project uses the Google search api to find URL-s based on folder names. From there [thum.io](https://www.thum.io) is used to generat thumbnails of the url-s.

## Video

https://user-images.githubusercontent.com/2664857/181109614-c2b1c286-ee9d-4ed9-b762-fb6e5b59ddfd.mp4

### Docker

```
docker create \
  --name=thumba \
  -e GOOGLE_SEARCH_KEY=key \
  -e GOOGLE_SEARCH_CX=projectId \
  -e THUM_KEY_ID=keyID \
  -e THUM_KEY_SECRET=keySecret \
	-e NEXT_PUBLIC_HOST=http://localhost \
	-e NEXT_PUBLIC_PORT=10010 \
  -v /path/to/host/config:/app/config \
  -v /path/to/host/thumbnail_folder:/app/video \
  -p 10010:10010 \
  --restart unless-stopped \
  bokker/thumba
```

You can optionally set the port using `NEXT_PUBLIC_PORT`
You can optionally set the host using `NEXT_PUBLIC_HOST` dont set the port here, just the IP, default is localhost it should match the host where you are accessing the service from.

Dockerhub: https://hub.docker.com/r/bokker/thumba/

### Usage

You will need two API keys and a search engine project CX ID. 

#### Google custom search API

Google custom search API is used to find website results based on the folder names. Google has a 100 search per day free tier but the paid options should be fairly cheap also.

1. sign up to https://programmablesearchengine.google.com/ 
2. create a new project with access to the entire web
3. grab the ID
4. Enable the search API at https://developers.google.com/custom-search/v1/introduction and grab the GOOGLE_SEARCH_KEY
5. (optional) Add billing account if more than free tier amounts needed at

#### Thum.io API

This service is used to generate the images from the URLs. They provide a paid plan that includes 10000 images for 1$ a month

1. sign up https://www.thum.io/signup
2. add credit card
3. generate a key at https://www.thum.io/admin/keys
4. copy keyID and keySecret (not key name)

### Contribution

I'm open to contributions & suggestions in making this a lot better :hand:

## License

[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
