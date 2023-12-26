import React, { useEffect, useRef } from 'react';

interface WaveformProps {
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
}

const Waveform: React.FC<WaveformProps> = ({ audioContext, analyser }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Function to draw the initial straight line
        const drawInitialLine = () => {
            ctx.beginPath();
            ctx.strokeStyle = 'blue';
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };

        // Call the function to draw the initial line
        drawInitialLine();

        if (!audioContext || !analyser) {
            return;
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!analyser) {
                return;
            }

            analyser.getByteTimeDomainData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.beginPath();

            let sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0;
                let y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            requestAnimationFrame(draw);
        };

        draw();
    }, [audioContext, analyser]);

    return <canvas ref={canvasRef} height="100" />;
};

export default Waveform;
