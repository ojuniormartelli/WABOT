Set WshShell = CreateObject("WScript.Shell")
WshShell.Run Replace(WScript.ScriptFullName, ".vbs", ".bat"), 0, False
