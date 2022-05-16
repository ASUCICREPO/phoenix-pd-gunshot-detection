from datetime import datetime
import re
import requests
from sympy import symbols, Eq, solve
import os
def download_file(url):
    local_filename = url.split('/')[-1]
    path = os.path.join('/tmp', local_filename)
    # NOTE the stream=True parameter below
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192): 
                # If you have chunk encoded response uncomment if
                # and set chunk_size parameter to None.
                #if chunk: 
                f.write(chunk)
    return path, local_filename
    
def get_timestamp(filename):
    match = re.search('\(.*\)', filename)
    if not match:
        raise ValueError('Invalid filename format')
    x = match.group(0)
    t = x.split('(')[-1]
    t = t.replace(')', '')
    t = t.replace('%3A','-')
    print(f'matched time {t}')
    dt_obj = datetime.strptime(t, "%a+%b++%d+%H-%M-%S+%Y")
    print(f'datetime obj {dt_obj}')
    return dt_obj
    
def get_solution(xA, yA, xB, yB, xC, yC, tA, tB, tC, C = 343):
    print(xA, yA, xB, yB, xC, yC, tA, tB, tC)
    x, y = symbols('x y')
    eq3 = Eq(
        (
            ( (x-xB)**2 + (y-yB)**2 ) ** (1/2) - ( (x-xA)**2 + (y-yA)**2 )**(1/2)
        ) / C, tB - tA
    )
    
    eq4 = Eq(
        (
            ( (x-xC)**2 + (y-yC)**2 ) ** (1/2) - ( (x-xA)**2 + (y-yA)**2 )**(1/2)
        ) / C, tC - tA
    )
    
    solution = solve((eq3, eq4), (x, y))
    return solution