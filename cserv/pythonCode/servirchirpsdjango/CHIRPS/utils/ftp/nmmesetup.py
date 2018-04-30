import os
import sys
import glob
import shutil

def makeDir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
def copydata(ym, inens, outens):
    dest_dir = '/data/data/cserv/nmmeInputTemp/'+ym+'/ens'+outens+'/'
    for file in glob.glob(r'/nfs/GEOOUT_ALL/'+ym+'/ens'+inens+'/*'):
            shutil.copy(file, dest_dir)

def rename(dir, pattern, rpattern):
    for pathAndFilename in glob.iglob(os.path.join(dir, '*')):
        title, ext = os.path.splitext(os.path.basename(pathAndFilename))
        title = title.replace(pattern, rpattern)
        os.rename(pathAndFilename, 
                  os.path.join(dir, title + ext))
def deleteContentsOf(directory):
    for the_file in os.listdir(directory):
        file_path = os.path.join(directory, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(e)
if __name__ == '__main__':
    print('Starting nmme ensemble mapping')
    if(len(sys.argv) < 3):
        print('year and month')
        sys.exit()
    else:
        print('Begin Mapping')
        yearmonth = sys.argv[1] + sys.argv[2]
        makeDir('/data/data/cserv/nmmeInputTemp/' + yearmonth)
        for x in range(1, 11):
            mynum = ''
            if x < 10:
                mynum = '0' + str(x)
            else:
                mynum = str(x)
            makeDir('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens' + mynum)

        copydata(yearmonth, '015', '01')
        copydata(yearmonth, '025', '02')
        copydata(yearmonth, '035', '03')
        copydata(yearmonth, '045', '04')
        copydata(yearmonth, '055', '05')
        copydata(yearmonth, '065', '06')
        copydata(yearmonth, '075', '07')
        copydata(yearmonth, '085', '08')
        copydata(yearmonth, '095', '09')
        copydata(yearmonth, '105', '10')

        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens01/',  'e015', 'e01')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens02/',  'e025', 'e02')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens03/',  'e035', 'e03')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens04/',  'e045', 'e04')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens05/',  'e055', 'e05')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens06/',  'e065', 'e06')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens07/',  'e075', 'e07')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens08/',  'e085', 'e08')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens09/',  'e095', 'e09')
        rename('/data/data/cserv/nmmeInputTemp/'+yearmonth+'/ens10/',  'e105', 'e10')

        shutil.rmtree('/data/data/image/input/nmme')
        makeDir('/data/data/image/input/nmme')