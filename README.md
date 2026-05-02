# revortana-cortana
A private Cortona revival server made by guutut.
To get Revortana, you need these things:
# Python
You can download/get it in python.org.
# mkcert
(You can get the release but  some things are not working.)
You can download/get it in GitHub.
# Notepad (run this as Administrator)
To make Revortana work, we have to tell Windows to stop calling Microsoft's dead servers and talk to your local machine instead.Open Notepad as Administrator (This is mandatory):Click Start, type Notepad.Right-click the Notepad icon and select Run as administrator.Click Yes on the security prompt.Navigate to the System Drivers:In Notepad, go to File > Open.In the file path bar at the top, paste this address and hit Enter:C:\Windows\System32\drivers\etcReveal Hidden Files:By default, the folder will look empty. Look at the bottom right of the "Open" window.Change the dropdown menu from Text Documents (*.txt) to All Files (*.*).Double-click the file named hosts.Inject the Revortana Redirection:Scroll to the very bottom of the text.Add these lines on their own new lines:text127.0.0.1  ://live.com
127.0.0.1  ://microsoft.com
127.0.0.1  bing.com
Save and Confirm:Go to File > Save.Verification: Open a Command Prompt and type ping ://microsoft.com. If it says Reply from 127.0.0.1, you have successfully hijacked the connection.
