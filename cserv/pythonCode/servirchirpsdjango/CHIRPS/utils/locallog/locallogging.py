'''
Created on Jan 29, 2015

@author: jeburks
'''
import sys
import logging
import CHIRPS.utils.configuration.parameters as params
from logging.handlers import RotatingFileHandler

class StreamToLogger(object):
   """
   Fake file-like stream object that redirects writes to a logger instance.
   """
   def __init__(self, logger, log_level=logging.INFO):
      self.logger = logger
      self.log_level = log_level
      self.linebuf = ''
 
   def write(self, buf):
      for line in buf.rstrip().splitlines():
         self.logger.log(self.log_level, line.rstrip())
 

 

 

def getNamedLogger(nameofLogger):
    logfilepath = params.logfilepath+nameofLogger+".log"
    
    logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M',
                    filename=logfilepath,
                    filemode='w')
    
    logger=logging.getLogger(nameofLogger)
    if (params.logToConsole == True):
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        logger.addHandler(ch)
   # sl = StreamToLogger(logger, logging.INFO)
   # sys.stdout = sl
   # sl = StreamToLogger(logger, logging.ERROR)
   # sys.stderr = sl
    return logger