'''
Created on Feb 13, 2014

@author: jeburks
'''

import tables
import matplotlib.pyplot as plt
import numpy as np

day = "07"
month = "07"
year = "2013"

sourcedir = "/Users/jeburks/work/data/SERVIR/chirps/hdf5/"
sourcefile = sourcedir+year+'.hdf' 
h5file = tables.openFile(sourcefile, 'r')


output = h5file.root.precip

locations = np.where(output[:,:,1] != -9999.99)
print output[locations]
#amount = output[]
#print sum(amount)


name = input("Date: ") 
print "Plotting ",name
plt.imshow(output[100:1000,100:1000,(int(name))])
plt.show()
h5file.close()




