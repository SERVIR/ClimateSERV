import json
from datetime import datetime
import requests
from bs4 import BeautifulSoup as bs

def getDatePattern(url):
	return url.split('_')[2].split('.')[0]

filePattern = '2019008'
response = requests.get('https://geo.nsstc.nasa.gov/SPoRT/outgoing/crh/4servir/')
soup = bs(response.text,"html.parser")
urls = []
names = []
for i, link in enumerate(soup.findAll('a')):
	_FULLURL = "https://geo.nsstc.nasa.gov/SPoRT/outgoing/crh/4servir/" + link.get('href')
	if _FULLURL.endswith('.tif.gz'):
		#check if datepattern is greater than filePattern
		if int(getDatePattern(link.get('href'))) > int(filePattern):
			print 'Appending: ', _FULLURL
			urls.append(_FULLURL)
			names.append(soup.select('a')[i].attrs['href'])
names_urls = zip(names, urls)