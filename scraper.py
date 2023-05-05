import requests
from requests_html import HTMLSession
import datetime
import threading
import concurrent.futures
from queue import Queue
from bs4 import BeautifulSoup as bs
import re
from urllib.parse import urlparse
from urllib.parse import parse_qs
requests.packages.urllib3.disable_warnings()

class ArtistInfo:
    def __init__(self):
        self.base_url="https://www.albumoftheyear.org"
        self.headers={
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
        }
        self.show_more="https://www.albumoftheyear.org/scripts/showMore.php"
        proxy = "http://bbf86cbe7d740fc7d5ada6ca2c2c477602f8eb23:js_render=true@proxy.zenrows.com:8001"#set api key here
        self.proxies = {"http": proxy, "https": proxy}
        
        self.session = HTMLSession()
        self.lock = threading.Lock()
        self.month_word=datetime.datetime.now().strftime("%B")  # full month name
        self.month_digit= datetime.datetime.now().strftime("%m")#month in digit
        self.current_year= datetime.datetime.now().year
        self.current_url=f"https://www.albumoftheyear.org/{self.current_year}/releases/{self.month_word}_{self.month_digit}.php/?s=release"
        self.current_date = datetime.datetime.now()
        self.current_year_month = self.current_date.strftime("%Y-%m")
        next_month = datetime.datetime.now().month + 1
        next_year = datetime.datetime.now().year
        if next_month > 12:
            next_month = 1
            next_year += 1
        self.next_month_digit = "{:02d}".format(next_month)
        self.next_month_word = datetime.datetime(next_year, next_month, 1).strftime("%B")
        self.next_year_month=datetime.datetime(next_year, next_month, 1).strftime("%Y-%m")
        self.next_month_url=f"https://www.albumoftheyear.org/{next_year}/releases/{self.next_month_word}_{self.next_month_digit}.php/?s=release"
        
    def get_type(self,current=True):
        """function to extract available types and numbers of release for the month"""
        url=""
        if current:
            url = self.current_url
        else:
            url=self.next_month_url
        
        #result= self.session.get(self.base_url)
        #result.html.render()
        result= requests.get(url,proxies=self.proxies,verify=False)
        print(url)
        print(result.status_code)
        if result.ok:
            
            soup=bs(result.text,"html.parser")
            item = soup.find("div",class_="facetItem")
        
            if item:
                
                facets = item.find_all("div",class_="facet")
            data={}
            for facet in facets:
        
                data[facet.find('a').text.lower()]=re.findall(r'[0-9,]+',facet.find('span').text)[0]
                
            return data
        return ""
    
    def extract_info(self,result):
        """this function extract release date, artist name and album info"""
        
        soup=bs(result.text,"html.parser")
        #div =soup.find("div",class_="fullWidth")
        divs = soup.find_all("div",class_="albumBlock")
        artist_data=[]
        for div in divs:
            temp={}
            date = div.find('div',class_="date").string
            artist=div.find('div',class_="artistTitle").string
            album= div.find('div',class_="albumTitle").string
            temp['date']=date
            temp['artist']=artist
            temp['release_name']=album
            artist_data.append(temp)
        return artist_data
    

    def make_request(self,payload,count):
        payload['start']=count
        #result = self.session.post(self.show_more, data=payload)
        result = requests.post(self.show_more, data=payload,proxies=self.proxies,verify=False)
        if result.ok:
            return self.extract_info(result)
        else:
            return None
        
    def collect_data_by_type(self,type_="",number_of_album="",current=True):
        new_url=""
        current_year_month=""
        if current:
            new_url= f"{self.current_url}&type={type_}"
            current_year_month=self.current_year_month
        else:
            new_url=f"{self.next_month_url}&type={type_}"
            current_year_month=self.next_year_month
        print(new_url)
        #get data from new_generated url and loop for multiple records based on total number of album
        #result=self.session.get(new_url)
        result=requests.get(new_url,proxies=self.proxies,verify=False)
        info=[]
        print(number_of_album)
        
        if result.ok:
            info.extend(self.extract_info(result))
        
        count = 0
        if number_of_album<60:
            return info
    
        worker_queue=Queue()
        
        payload={
            'type': 'albumMonth',
            'sort': 'release',
            'albumType': type_,
            'start': count,
            'date': f"{current_year_month}",
            }

        
        futures=[]    
        
        # define a generator function to yield payloads
        
        while count<number_of_album:
            count+=60
            
            worker_queue.put([payload,count])
    
        
        # process the payloads concurrently with a maximum of 10 threads
        while not worker_queue.empty():
            max_workers=10
            
            if worker_queue.qsize()<10:
                max_workers=worker_queue.qsize()
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                    for i in range(max_workers):
                        payload,count =worker_queue.get()
                        
                        future = executor.submit(self.make_request,payload,count)
                        futures.append(future)
                # process the results
            for future in futures:
                extracted_info = future.result()
                if extracted_info is not None:
                    with self.lock:
                        info.extend(extracted_info)
                futures=[]
        return info
        

def get_artist(type_="",current=True):
    artist_info=ArtistInfo()
    data=artist_info.get_type(current)
    
    if data:
        if type_ in data:
            number_of_album=data.get(type_)
            number_of_album=int(number_of_album.replace(",",""))
            info = artist_info.collect_data_by_type(type_,number_of_album=number_of_album,current=current)
            return {type_:info}
        
        return {type_:"unknown type"}
if __name__=="__main__":
    type_="ep"
    current_month=True
    artist = get_artist(type_,current=current_month)
    if artist:
    
        print(len(artist[type_]))
        print(artist)
    else:
        print("No info found check your type")